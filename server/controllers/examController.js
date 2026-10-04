const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const Topic = require("../models/Topic");

// Stops the server from crashing if someone sends a broken id
const isValidId = (id) => mongoose.isValidObjectId(id);

// GET /api/exams
const getExams = async (req, res) => {
    try {
        const exams = await Exam.find({ isActive: true }).sort({ order: 1 });
        res.json({ exams });
    } catch (error) {
        console.error("getExams error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

// GET /api/exams/:examId/subjects
const getSubjects = async (req, res) => {
    try {
        const { examId } = req.params;
        if (!isValidId(examId)) {
            return res.status(400).json({ message: "Invalid exam id" });
        }
        const subjects = await Subject.find({ examId, isActive: true }).sort({ order: 1 });
        res.json({ subjects });
    } catch (error) {
        console.error("getSubjects error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

// GET /api/subjects/:subjectId/chapters
const getChapters = async (req, res) => {
    try {
        const { subjectId } = req.params;
        if (!isValidId(subjectId)) {
            return res.status(400).json({ message: "Invalid subject id" });
        }
        const chapters = await Chapter.find({ subjectId, isActive: true }).sort({ order: 1 });
        res.json({ chapters });
    } catch (error) {
        console.error("getChapters error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

// GET /api/chapters/:chapterId/topics
const getTopics = async (req, res) => {
    try {
        const { chapterId } = req.params;
        if (!isValidId(chapterId)) {
            return res.status(400).json({ message: "Invalid chapter id" });
        }
        const topics = await Topic.find({ chapterId, isActive: true }).sort({ order: 1 });
        res.json({ topics });
    } catch (error) {
        console.error("getTopics error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

module.exports = { getExams, getSubjects, getChapters, getTopics };