const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

// Running totals for one subject, chapter or topic
const statSchema = new mongoose.Schema(
    {
        refId: { type: ObjectId, required: true },
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        lastAttemptAt: { type: Date },
    },
    { _id: false }
);

// Activity for one day (date is "YYYY-MM-DD" in Indian time)
const dailySchema = new mongoose.Schema(
    {
        date: { type: String, required: true },
        attempted: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        timeSec: { type: Number, default: 0 },
    },
    { _id: false }
);

const progressSchema = new mongoose.Schema(
    {
        userId: { type: ObjectId, ref: "User", required: true },
        examId: { type: ObjectId, ref: "Exam", required: true },
        totals: {
            attempted: { type: Number, default: 0 },
            correct: { type: Number, default: 0 },
            incorrect: { type: Number, default: 0 },
            timeSec: { type: Number, default: 0 },
            testsTaken: { type: Number, default: 0 },
        },
        subjects: { type: [statSchema], default: [] },
        chapters: { type: [statSchema], default: [] },
        topics: { type: [statSchema], default: [] },
        daily: { type: [dailySchema], default: [] },
        wrongQuestionIds: [{ type: ObjectId, ref: "Question" }],
    },
    { timestamps: true }
);

// One progress document per student per exam
progressSchema.index({ userId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);