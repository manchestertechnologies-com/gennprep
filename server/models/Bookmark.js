const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const bookmarkSchema = new mongoose.Schema(
    {
        userId: { type: ObjectId, ref: "User", required: true },
        questionId: { type: ObjectId, ref: "Question", required: true },
        // Copied from the question so the list can be filtered quickly
        examId: { type: ObjectId, ref: "Exam" },
        subjectId: { type: ObjectId, ref: "Subject" },
        chapterId: { type: ObjectId, ref: "Chapter" },
        note: { type: String, default: "", maxlength: 500 },
    },
    { timestamps: true }
);

// A student can bookmark a question only once
bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1, chapterId: 1 });

module.exports = mongoose.model("Bookmark", bookmarkSchema);