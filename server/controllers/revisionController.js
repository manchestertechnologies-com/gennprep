const mongoose = require("mongoose");
const TestAttempt = require("../models/TestAttempt");
const Question = require("../models/Question");
const Exam = require("../models/Exam");
const Progress = require("../models/Progress");
const Bookmark = require("../models/Bookmark");

const isValidId = (id) => mongoose.isValidObjectId(id);

// Fields a student may see before submitting (no answers)
const STUDENT_FIELDS = "type text images options difficulty subjectId chapterId topicId";

// Mixes up a list so each practice gets a different order
const shuffle = (list) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

// Shared by both practice types: builds an attempt from a list of question ids
const createPracticeFromIds = async (req, res, exam, questionIds, mode) => {
    const size = Math.min(Math.max(parseInt(req.body.count) || 10, 1), 60);
    const pickedIds = shuffle(questionIds.map(String)).slice(0, size);

    const questions = await Question.find({ _id: { $in: pickedIds }, status: "published" })
        .select(STUDENT_FIELDS)
        .lean();

    if (questions.length === 0) {
        return res.status(404).json({ message: "No questions available to practise yet" });
    }

    const markingScheme = {
        correct: exam.markingScheme.correct,
        incorrect: exam.markingScheme.incorrect,
        unanswered: exam.markingScheme.unanswered,
    };

    const attempt = await TestAttempt.create({
        userId: req.user._id,
        examId: exam._id,
        mode,
        filters: { count: size },
        markingScheme,
        answers: questions.map((q) => ({
            questionId: q._id,
            subjectId: q.subjectId,
            chapterId: q.chapterId,
            topicId: q.topicId,
        })),
    });

    // Submit uses the normal endpoint: POST /api/attempts/:id/submit
    return res.status(201).json({
        attemptId: attempt._id,
        mode,
        totalQuestions: questions.length,
        markingScheme,
        questions,
    });
};

// POST /api/attempts/wrong-answers   Body: { examId, count }
const startWrongAnswerPractice = async (req, res) => {
    try {
        const { examId } = req.body;
        if (!isValidId(examId)) return res.status(400).json({ message: "A valid examId is required" });

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: "Exam not found" });

        const progress = await Progress.findOne({ userId: req.user._id, examId }).lean();
        const wrongIds = progress?.wrongQuestionIds || [];

        if (wrongIds.length === 0) {
            return res.status(404).json({ message: "No wrong answers to revise. Great job!" });
        }

        return await createPracticeFromIds(req, res, exam, wrongIds, "wrong_answer_practice");
    } catch (error) {
        console.error("startWrongAnswerPractice error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

// POST /api/attempts/bookmarks   Body: { examId, count }
const startBookmarkPractice = async (req, res) => {
    try {
        const { examId } = req.body;
        if (!isValidId(examId)) return res.status(400).json({ message: "A valid examId is required" });

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: "Exam not found" });

        const bookmarks = await Bookmark.find({ userId: req.user._id, examId }).select("questionId").lean();

        if (bookmarks.length === 0) {
            return res.status(404).json({ message: "You have no bookmarked questions yet" });
        }

        const ids = bookmarks.map((b) => b.questionId);
        return await createPracticeFromIds(req, res, exam, ids, "bookmark_practice");
    } catch (error) {
        console.error("startBookmarkPractice error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

module.exports = { startWrongAnswerPractice, startBookmarkPractice };
