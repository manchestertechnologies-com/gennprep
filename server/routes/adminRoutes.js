const express = require("express");
const protect = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");
const {
    createQuestion,
    listQuestions,
    getQuestion,
    updateQuestion,
    deleteQuestion,
} = require("../controllers/questionController");
const { createTest, listTestsAdmin, deleteTest } = require("../controllers/testController");
const admin = require("../controllers/adminController");
const uploadImage = require("../middleware/upload");
const { uploadQuestionImage } = require("../controllers/uploadController");

const router = express.Router();

// Every route in this file needs: logged in AND admin
router.use(protect, isAdmin);

router.get("/overview", admin.getOverview);
router.post("/upload", uploadImage, uploadQuestionImage);

// Questions
router.post("/questions", createQuestion);
router.get("/questions", listQuestions);
router.get("/questions/:id", getQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

// Syllabus
router.post("/chapters", admin.createChapter);
router.put("/chapters/:id", admin.updateChapter);
router.delete("/chapters/:id", admin.deleteChapter);
router.post("/topics", admin.createTopic);
router.delete("/topics/:id", admin.deleteTopic);

// Mock tests
router.post("/tests", createTest);
router.get("/tests", listTestsAdmin);
router.delete("/tests/:id", deleteTest);

// Students
router.get("/students", admin.listStudents);
router.put("/students/:id/status", admin.setStudentStatus);

module.exports = router;