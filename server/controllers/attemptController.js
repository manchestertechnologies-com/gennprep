const mongoose = require("mongoose");
const TestAttempt = require("../models/TestAttempt");
const Question = require("../models/Question");
const Chapter = require("../models/Chapter");
const Exam = require("../models/Exam");
const { finalizeAttempt, isExpired } = require("../utils/finalizeAttempt");
const { STUDENT_FIELDS, buildReview, mockExtras } = require("../utils/attemptHelpers");
const { saveAnswers, getAttempt } = require("./attemptSessionController");

const isValidId = (id) => mongoose.isValidObjectId(id);
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// POST /api/attempts/practice
const startPractice = async (req, res) => {
    try {
        const { chapterId, topicIds = [], difficulty = "any", count = 10 } = req.body;
        if (!isValidId(chapterId)) return res.status(400).json({ message: "A valid chapterId is required" });

        const chapter = await Chapter.findById(chapterId);
        if (!chapter) return res.status(404).json({ message: "Chapter not found" });
        const exam = await Exam.findById(chapter.examId);

        const size = Math.min(Math.max(parseInt(count) || 10, 1), 50);
        const match = { chapterId: toObjectId(chapterId), status: "published" };

        const validTopicIds = (Array.isArray(topicIds) ? topicIds : [topicIds]).filter(isValidId);
        if (validTopicIds.length > 0) match.topicId = { $in: validTopicIds.map(toObjectId) };
        if (["easy", "medium", "hard"].includes(difficulty)) match.difficulty = difficulty;

        const questions = await Question.aggregate([{ $match: match }, { $sample: { size } }, { $project: STUDENT_FIELDS }]);
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

        res.status(201).json({ attemptId: attempt._id, totalQuestions: questions.length, markingScheme, questions });
    } catch (error) {
        console.error("startPractice error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

// POST /api/attempts/:id/submit
const submitAttempt = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid attempt id" });
        const attempt = await TestAttempt.findOne({ _id: req.params.id, userId: req.user._id });
        if (!attempt) return res.status(404).json({ message: "Attempt not found" });
        if (attempt.status !== "in_progress") {
            return res.status(400).json({ message: "This attempt is already submitted" });
        }

        // After the deadline, the browser's answers are ignored and the last autosave is used
        const timeUp = isExpired(attempt);
        const questionsById = await finalizeAttempt(attempt, req.body.answers, timeUp);

        res.json({
            message: timeUp ? "Time was up, so your last saved answers were submitted" : "Submitted",
            ...buildReview(attempt, questionsById, await mockExtras(attempt)),
        });
    } catch (error) {
        console.error("submitAttempt error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

module.exports = { startPractice, saveAnswers, submitAttempt, getAttempt };