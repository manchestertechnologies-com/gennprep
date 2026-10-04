const mongoose = require("mongoose");
const TestAttempt = require("../models/TestAttempt");
const Question = require("../models/Question");
const Chapter = require("../models/Chapter");
const Exam = require("../models/Exam");
const scoreAttempt = require("../utils/scoreAttempt");
const { updateProgress } = require("../utils/updateProgress"); // NEW

const isValidId = (id) => mongoose.isValidObjectId(id);
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// The only question fields a student may see BEFORE submitting (no answers!)
const STUDENT_FIELDS = {
    type: 1,
    text: 1,
    images: 1,
    options: 1,
    difficulty: 1,
    subjectId: 1,
    chapterId: 1,
    topicId: 1,
};

// Builds the "review" shown after submitting
const buildReview = (attempt, questionsById) => ({
    attemptId: attempt._id,
    status: attempt.status,
    result: attempt.result,
    review: attempt.answers.map((a, index) => {
        const q = questionsById.get(String(a.questionId));
        return {
            number: index + 1,
            questionId: a.questionId,
            text: q ? q.text : "(this question was removed)",
            type: q ? q.type : null,
            images: q ? q.images : [],
            options: q ? q.options : [],
            selectedOptionIds: a.selectedOptionIds,
            correctOptionIds: a.correctOptionIds,
            numericalValue: a.numericalValue,
            isCorrect: a.isCorrect,
            marksAwarded: a.marksAwarded,
            timeSpentSec: a.timeSpentSec,
            explanation: q ? q.explanation : null,
        };
    }),
});

// POST /api/attempts/practice
const startPractice = async (req, res) => {
    try {
        const { chapterId, topicIds = [], difficulty = "any", count = 10 } = req.body;

        if (!isValidId(chapterId)) {
            return res.status(400).json({ message: "A valid chapterId is required" });
        }

        const chapter = await Chapter.findById(chapterId);
        if (!chapter) return res.status(404).json({ message: "Chapter not found" });

        const exam = await Exam.findById(chapter.examId);

        const size = Math.min(Math.max(parseInt(count) || 10, 1), 50);

        const match = { chapterId: toObjectId(chapterId), status: "published" };

        const validTopicIds = (Array.isArray(topicIds) ? topicIds : [topicIds]).filter(isValidId);
        if (validTopicIds.length > 0) {
            match.topicId = { $in: validTopicIds.map(toObjectId) };
        }

        if (["easy", "medium", "hard"].includes(difficulty)) {
            match.difficulty = difficulty;
        }

        const questions = await Question.aggregate([
            { $match: match },
            { $sample: { size } },
            { $project: STUDENT_FIELDS },
        ]);

        if (questions.length === 0) {
            return res.status(404).json({ message: "No questions found for these choices" });
        }

        const markingScheme = {
            correct: exam.markingScheme.correct,
            incorrect: exam.markingScheme.incorrect,
            unanswered: exam.markingScheme.unanswered,
        };

        const attempt = await TestAttempt.create({
            userId: req.user._id,
            examId: exam._id,
            mode: "practice",
            filters: { chapterId, topicIds: validTopicIds, difficulty, count: size },
            markingScheme,
            answers: questions.map((q) => ({
                questionId: q._id,
                subjectId: q.subjectId,
                chapterId: q.chapterId,
                topicId: q.topicId,
            })),
        });

        res.status(201).json({
            attemptId: attempt._id,
            totalQuestions: questions.length,
            markingScheme,
            questions,
        });
    } catch (error) {
        console.error("startPractice error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

// POST /api/attempts/:id/submit
const submitAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ message: "Invalid attempt id" });

        const attempt = await TestAttempt.findOne({ _id: id, userId: req.user._id });
        if (!attempt) return res.status(404).json({ message: "Attempt not found" });

        if (attempt.status !== "in_progress") {
            return res.status(400).json({ message: "This attempt is already submitted" });
        }

        const questionIds = attempt.answers.map((a) => a.questionId);
        const questions = await Question.find({ _id: { $in: questionIds } }).select(
            "+correctOptionIds +numericalAnswer"
        );
        const questionsById = new Map(questions.map((q) => [String(q._id), q]));

        attempt.result = scoreAttempt(attempt, req.body.answers, questionsById);
        attempt.status = "submitted";
        attempt.submittedAt = new Date();
        await attempt.save();

        // NEW: add this attempt into the student's progress.
        // If it fails, the student still gets their result.
        try {
            await updateProgress(attempt);
        } catch (progressError) {
            console.error("updateProgress error:", progressError.message);
        }

        const statUpdates = attempt.answers
            .filter((a) => a.isCorrect !== null)
            .map((a) => ({
                updateOne: {
                    filter: { _id: a.questionId },
                    update: { $inc: { "stats.attempts": 1, "stats.correct": a.isCorrect ? 1 : 0 } },
                },
            }));
        if (statUpdates.length > 0) await Question.bulkWrite(statUpdates);

        res.json({ message: "Submitted", ...buildReview(attempt, questionsById) });
    } catch (error) {
        console.error("submitAttempt error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

// GET /api/attempts/:id
const getAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) return res.status(400).json({ message: "Invalid attempt id" });

        const attempt = await TestAttempt.findOne({ _id: id, userId: req.user._id });
        if (!attempt) return res.status(404).json({ message: "Attempt not found" });

        const questionIds = attempt.answers.map((a) => a.questionId);

        if (attempt.status === "in_progress") {
            const questions = await Question.find({ _id: { $in: questionIds } }).select(
                Object.keys(STUDENT_FIELDS).join(" ")
            );
            const byId = new Map(questions.map((q) => [String(q._id), q]));
            return res.json({
                attemptId: attempt._id,
                status: attempt.status,
                markingScheme: attempt.markingScheme,
                questions: questionIds.map((qid) => byId.get(String(qid))).filter(Boolean),
            });
        }

        const questions = await Question.find({ _id: { $in: questionIds } });
        const questionsById = new Map(questions.map((q) => [String(q._id), q]));
        res.json(buildReview(attempt, questionsById));
    } catch (error) {
        console.error("getAttempt error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

module.exports = { startPractice, submitAttempt, getAttempt };