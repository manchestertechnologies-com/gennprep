const mongoose = require("mongoose");
const Test = require("../models/Test");
const Question = require("../models/Question");
const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const TestAttempt = require("../models/TestAttempt");
const { finalizeAttempt, isExpired } = require("../utils/finalizeAttempt");

const isValidId = (id) => mongoose.isValidObjectId(id);
const toObjectId = (id) => new mongoose.Types.ObjectId(id);
const TEST_TYPES = ["chapter", "subject", "full_syllabus", "pyq", "custom"];

// An error whose message is safe to show to the user
const userError = (message, status = 400) => Object.assign(new Error(message), { status });

const sendError = (res, error, where) => {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error(`${where} error:`, error.message);
    return res.status(500).json({ message: "Something went wrong on the server" });
};

// Fills one section: the exact questions listed, or random ones by count
const buildSection = async (examId, section) => {
    if (!isValidId(section.subjectId)) throw userError("Each section needs a valid subjectId");
    const subject = await Subject.findOne({ _id: section.subjectId, examId });
    if (!subject) throw userError("A section's subject does not belong to this exam");

    // Option 1: the admin chose exact questions
    if (Array.isArray(section.questionIds) && section.questionIds.length > 0) {
        const ids = section.questionIds.filter(isValidId);
        const found = await Question.countDocuments({ _id: { $in: ids }, subjectId: subject._id, status: "published" });
        if (found !== ids.length) throw userError(`Some ${subject.name} questions were not found or are not published`);
        return { name: subject.name, subjectId: subject._id, questionIds: ids };
    }

    // Option 2: pick random published questions
    const count = parseInt(section.count) || 0;
    if (count < 1) throw userError(`Give a question count for ${subject.name}`);

    const match = { examId: toObjectId(examId), subjectId: subject._id, status: "published" };
    const chapterIds = (section.chapterIds || []).filter(isValidId);
    if (chapterIds.length > 0) match.chapterId = { $in: chapterIds.map(toObjectId) };

    const picked = await Question.aggregate([{ $match: match }, { $sample: { size: count } }, { $project: { _id: 1 } }]);
    if (picked.length < count) {
        throw userError(`Only ${picked.length} published ${subject.name} questions are available, but ${count} were requested`);
    }
    return { name: subject.name, subjectId: subject._id, questionIds: picked.map((q) => q._id) };
};

// ADMIN: POST /api/admin/tests
// Body: { title, examId, type, durationMinutes, instructions, maxAttempts,
//         sections: [{ subjectId, count, chapterIds? }  or  { subjectId, questionIds }] }
const createTest = async (req, res) => {
    try {
        const { title, examId, type = "subject", durationMinutes, instructions = "", maxAttempts = 0, sections, status = "published" } = req.body;

        if (!title || !title.trim()) throw userError("A title is required");
        if (!isValidId(examId)) throw userError("A valid examId is required");
        const exam = await Exam.findById(examId);
        if (!exam) throw userError("Exam not found", 404);

        const minutes = parseInt(durationMinutes);
        if (!minutes || minutes < 1 || minutes > 360) throw userError("Duration must be between 1 and 360 minutes");
        if (!TEST_TYPES.includes(type)) throw userError(`Type must be one of: ${TEST_TYPES.join(", ")}`);
        if (!Array.isArray(sections) || sections.length === 0) throw userError("Add at least one section");

        const built = [];
        for (const section of sections) built.push(await buildSection(examId, section));

        const totalQuestions = built.reduce((sum, s) => sum + s.questionIds.length, 0);
        const markingScheme = {
            correct: exam.markingScheme.correct,
            incorrect: exam.markingScheme.incorrect,
            unanswered: exam.markingScheme.unanswered,
        };

        const test = await Test.create({
            title: title.trim(),
            examId,
            type,
            sections: built,
            durationMinutes: minutes,
            markingScheme,
            totalQuestions,
            totalMarks: totalQuestions * markingScheme.correct,
            instructions,
            maxAttempts: Math.max(0, parseInt(maxAttempts) || 0),
            status: ["draft", "published"].includes(status) ? status : "published",
            createdBy: req.user._id,
        });

        res.status(201).json({ message: "Test created", test });
    } catch (error) {
        sendError(res, error, "createTest");
    }
};

// ADMIN: GET /api/admin/tests?examId=...
const listTestsAdmin = async (req, res) => {
    try {
        const filter = { status: { $ne: "archived" } };
        if (isValidId(req.query.examId)) filter.examId = req.query.examId;
        const tests = await Test.find(filter).sort({ createdAt: -1 }).select("-sections.questionIds").lean();
        res.json({ tests });
    } catch (error) {
        sendError(res, error, "listTestsAdmin");
    }
};

// ADMIN: DELETE /api/admin/tests/:id  (archive, so old results keep working)
const deleteTest = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) throw userError("Invalid test id");
        const test = await Test.findByIdAndUpdate(req.params.id, { status: "archived" });
        if (!test) throw userError("Test not found", 404);
        res.json({ message: "Test deleted (archived)" });
    } catch (error) {
        sendError(res, error, "deleteTest");
    }
};

// STUDENT: GET /api/tests?examId=...
const listTests = async (req, res) => {
    try {
        const { examId } = req.query;
        if (!isValidId(examId)) throw userError("A valid examId is required");

        const tests = await Test.find({ examId, status: "published" })
            .sort({ createdAt: -1 })
            .select("title type durationMinutes totalQuestions totalMarks maxAttempts instructions markingScheme availability stats sections.name")
            .lean();

        const attempts = await TestAttempt.find({ userId: req.user._id, testId: { $in: tests.map((t) => t._id) } })
            .sort({ createdAt: -1 })
            .select("testId status result.score expiresAt")
            .lean();

        const now = new Date();
        res.json({
            tests: tests.map((t) => {
                const mine = attempts.filter((a) => String(a.testId) === String(t._id));
                const done = mine.filter((a) => a.status !== "in_progress");
                const open = mine.find((a) => a.status === "in_progress" && !isExpired(a));
                const scores = done.map((a) => a.result?.score).filter((s) => typeof s === "number");
                const startsAt = t.availability?.startsAt;
                const endsAt = t.availability?.endsAt;
                return {
                    ...t,
                    sections: t.sections.map((s) => s.name),
                    attemptsUsed: mine.length,
                    bestScore: scores.length ? Math.max(...scores) : null,
                    lastAttemptId: done[0]?._id || null,
                    inProgressAttemptId: open ? open._id : null,
                    isOpen: (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now),
                };
            }),
        });
    } catch (error) {
        sendError(res, error, "listTests");
    }
};

// STUDENT: POST /api/tests/:id/start
const startTest = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) throw userError("Invalid test id");
        const test = await Test.findOne({ _id: req.params.id, status: "published" });
        if (!test) throw userError("Test not found", 404);

        const now = new Date();
        if (test.availability?.startsAt && test.availability.startsAt > now) throw userError("This test has not opened yet", 403);
        if (test.availability?.endsAt && test.availability.endsAt < now) throw userError("This test has closed", 403);

        // Resume an unfinished attempt instead of starting a new one
        const open = await TestAttempt.findOne({ userId: req.user._id, testId: test._id, status: "in_progress" });
        if (open) {
            if (!isExpired(open)) return res.json({ attemptId: open._id, resumed: true });
            await finalizeAttempt(open, null, true); // its time ran out while the student was away
        }

        if (test.maxAttempts > 0) {
            const used = await TestAttempt.countDocuments({ userId: req.user._id, testId: test._id });
            if (used >= test.maxAttempts) throw userError(`You have used all ${test.maxAttempts} attempt(s) for this test`, 403);
        }

        // Keep the question order of the sections
        const orderedIds = test.sections.flatMap((s) => s.questionIds);
        const questions = await Question.find({ _id: { $in: orderedIds }, status: "published" })
            .select("subjectId chapterId topicId")
            .lean();
        const byId = new Map(questions.map((q) => [String(q._id), q]));
        const answers = orderedIds
            .map((qid) => byId.get(String(qid)))
            .filter(Boolean)
            .map((q) => ({ questionId: q._id, subjectId: q.subjectId, chapterId: q.chapterId, topicId: q.topicId }));
        if (answers.length === 0) throw userError("This test has no available questions");

        const attempt = await TestAttempt.create({
            userId: req.user._id,
            examId: test.examId,
            mode: "mock",
            testId: test._id,
            markingScheme: {
                correct: test.markingScheme.correct,
                incorrect: test.markingScheme.incorrect,
                unanswered: test.markingScheme.unanswered,
            },
            startedAt: now,
            expiresAt: new Date(now.getTime() + test.durationMinutes * 60 * 1000), // the official deadline
            answers,
        });

        res.status(201).json({ attemptId: attempt._id, resumed: false });
    } catch (error) {
        sendError(res, error, "startTest");
    }
};

module.exports = { createTest, listTestsAdmin, deleteTest, listTests, startTest };
