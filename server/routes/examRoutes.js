const express = require("express");
const protect = require("../middleware/auth");
const {
    getExams,
    getSubjects,
    getChapters,
    getTopics,
} = require("../controllers/examController");

const router = express.Router();

// All of these need the student to be logged in
router.get("/exams", protect, getExams);
router.get("/exams/:examId/subjects", protect, getSubjects);
router.get("/subjects/:subjectId/chapters", protect, getChapters);
router.get("/chapters/:chapterId/topics", protect, getTopics);

module.exports = router;