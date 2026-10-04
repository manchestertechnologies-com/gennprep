require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const Topic = require("../models/Topic");

// Turns "Motion in a Straight Line" into "motion-in-a-straight-line"
const slugify = (text) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Options used for every save below:
// upsert = create if missing, update if it exists (no duplicates)
// returnDocument "after" = give back the saved version
const saveOptions = { upsert: true, returnDocument: "after", runValidators: true };

const exams = [
    {
        code: "NEET",
        name: "NEET UG",
        description: "National Eligibility cum Entrance Test for medical courses",
        markingScheme: { correct: 4, incorrect: -1, unanswered: 0 },
        durationMinutes: 180,
        subjects: ["Physics", "Chemistry", "Botany", "Zoology"],
    },
    {
        code: "JEE",
        name: "JEE Main",
        description: "Joint Entrance Examination for engineering courses",
        markingScheme: { correct: 4, incorrect: -1, unanswered: 0 },
        durationMinutes: 180,
        subjects: ["Physics", "Chemistry", "Mathematics"],
    },
    {
        code: "KCET",
        name: "Karnataka CET",
        description: "Karnataka Common Entrance Test",
        markingScheme: { correct: 1, incorrect: 0, unanswered: 0 },
        durationMinutes: 80,
        subjects: ["Physics", "Chemistry", "Mathematics", "Biology"],
    },
];

// A few sample chapters and topics so we have something to test with.
// Admins will add the rest from the admin panel later.
const sampleChapters = [
    {
        examCode: "NEET",
        subject: "Physics",
        name: "Units and Measurements",
        classLevel: "11",
        topics: ["SI Units", "Significant Figures", "Dimensional Analysis"],
    },
    {
        examCode: "NEET",
        subject: "Physics",
        name: "Motion in a Straight Line",
        classLevel: "11",
        topics: ["Speed and Velocity", "Acceleration", "Equations of Motion"],
    },
];

const seed = async () => {
    await connectDB();

    // 1. Exams and their subjects
    for (const [examIndex, data] of exams.entries()) {
        const { subjects, ...examFields } = data;

        const exam = await Exam.findOneAndUpdate(
            { code: data.code },
            { ...examFields, slug: slugify(data.code), order: examIndex },
            saveOptions
        );
        console.log(`Exam: ${exam.code}`);

        for (const [subjectIndex, subjectName] of subjects.entries()) {
            await Subject.findOneAndUpdate(
                { examId: exam._id, slug: slugify(subjectName) },
                {
                    examId: exam._id,
                    name: subjectName,
                    slug: slugify(subjectName),
                    order: subjectIndex,
                },
                saveOptions
            );
            console.log(`   Subject: ${subjectName}`);
        }
    }

    // 2. Sample chapters and topics
    for (const [chapterIndex, ch] of sampleChapters.entries()) {
        const exam = await Exam.findOne({ code: ch.examCode });
        const subject = await Subject.findOne({
            examId: exam._id,
            slug: slugify(ch.subject),
        });

        const chapter = await Chapter.findOneAndUpdate(
            { subjectId: subject._id, slug: slugify(ch.name) },
            {
                examId: exam._id,
                subjectId: subject._id,
                name: ch.name,
                slug: slugify(ch.name),
                classLevel: ch.classLevel,
                order: chapterIndex,
            },
            saveOptions
        );
        console.log(`Chapter: ${ch.examCode} > ${ch.subject} > ${chapter.name}`);

        for (const [topicIndex, topicName] of ch.topics.entries()) {
            await Topic.findOneAndUpdate(
                { chapterId: chapter._id, slug: slugify(topicName) },
                {
                    examId: exam._id,
                    subjectId: subject._id,
                    chapterId: chapter._id,
                    name: topicName,
                    slug: slugify(topicName),
                    order: topicIndex,
                },
                saveOptions
            );
            console.log(`   Topic: ${topicName}`);
        }
    }

    console.log("Seeding finished");
    await mongoose.disconnect();
};

seed().catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exit(1);
});