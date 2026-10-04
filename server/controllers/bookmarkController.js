const mongoose = require("mongoose");
const Bookmark = require("../models/Bookmark");
const Question = require("../models/Question");

const isValidId = (id) => mongoose.isValidObjectId(id);

// POST /api/bookmarks   Body: { questionId, note }
// Saving the same question twice just updates the note (no duplicates)
const addBookmark = async (req, res) => {
    try {
        const { questionId, note = "" } = req.body;
        if (!isValidId(questionId)) {
            return res.status(400).json({ message: "A valid questionId is required" });
        }

        const question = await Question.findOne({ _id: questionId, status: "published" });
        if (!question) return res.status(404).json({ message: "Question not found" });

        const bookmark = await Bookmark.findOneAndUpdate(
            { userId: req.user._id, questionId },
            {
                userId: req.user._id,
                questionId,
                examId: question.examId,
                subjectId: question.subjectId,
                chapterId: question.chapterId,
                note: String(note).slice(0, 500),
            },
            { upsert: true, returnDocument: "after", runValidators: true }
        );

        res.status(201).json({ message: "Bookmarked", bookmark });
    } catch (error) {
        console.error("addBookmark error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

// DELETE /api/bookmarks/:questionId
const removeBookmark = async (req, res) => {
    try {
        const { questionId } = req.params;
        if (!isValidId(questionId)) return res.status(400).json({ message: "Invalid question id" });

        const result = await Bookmark.deleteOne({ userId: req.user._id, questionId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Bookmark not found" });
        }
        res.json({ message: "Bookmark removed" });
    } catch (error) {
        console.error("removeBookmark error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

// GET /api/bookmarks?examId=...&chapterId=...
// Shows the questions WITHOUT answers, so a bookmark can't be used to cheat in a test
const listBookmarks = async (req, res) => {
    try {
        const filter = { userId: req.user._id };
        if (isValidId(req.query.examId)) filter.examId = req.query.examId;
        if (isValidId(req.query.chapterId)) filter.chapterId = req.query.chapterId;

        const bookmarks = await Bookmark.find(filter)
            .sort({ createdAt: -1 })
            .populate("questionId", "text images options difficulty type")
            .lean();

        res.json({
            total: bookmarks.length,
            bookmarks: bookmarks
                .filter((b) => b.questionId) // skip questions that were deleted
                .map((b) => ({
                    bookmarkId: b._id,
                    note: b.note,
                    savedAt: b.createdAt,
                    question: b.questionId,
                })),
        });
    } catch (error) {
        console.error("listBookmarks error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

module.exports = { addBookmark, removeBookmark, listBookmarks };