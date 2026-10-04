const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

// A section groups questions, usually one per subject ("Physics", "Chemistry"...)
const sectionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        subjectId: { type: ObjectId, ref: "Subject" },
        questionIds: [{ type: ObjectId, ref: "Question" }],
    },
    { _id: false }
);

const testSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        examId: { type: ObjectId, ref: "Exam", required: true },
        type: {
            type: String,
            enum: ["chapter", "subject", "full_syllabus", "pyq", "custom"],
            default: "subject",
        },
        sections: { type: [sectionSchema], default: [] },
        durationMinutes: { type: Number, required: true, min: 1, max: 360 },
        markingScheme: {
            correct: { type: Number, default: 4 },
            incorrect: { type: Number, default: -1 },
            unanswered: { type: Number, default: 0 },
        },
        totalQuestions: { type: Number, default: 0 },
        totalMarks: { type: Number, default: 0 },
        instructions: { type: String, default: "" },
        maxAttempts: { type: Number, default: 0 }, // 0 = unlimited
        availability: {
            startsAt: { type: Date },
            endsAt: { type: Date },
        },
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "published",
        },
        createdBy: { type: ObjectId, ref: "User" },
        stats: {
            attempts: { type: Number, default: 0 },
            topScore: { type: Number, default: null },
        },
    },
    { timestamps: true }
);

testSchema.index({ examId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Test", testSchema);