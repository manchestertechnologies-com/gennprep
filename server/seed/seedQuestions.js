require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const Topic = require("../models/Topic");
const Question = require("../models/Question");

const saveOptions = { upsert: true, returnDocument: "after", runValidators: true };

// options are listed in order A, B, C, D
const questions = [
    {
        chapter: "units-and-measurements",
        topic: "si-units",
        text: "The SI unit of luminous intensity is",
        options: ["lumen", "candela", "lux", "watt"],
        correct: "B",
        difficulty: "easy",
        explanation: "Candela is one of the seven SI base units and measures luminous intensity.",
    },
    {
        chapter: "units-and-measurements",
        topic: "si-units",
        text: "How many base (fundamental) quantities are there in the SI system?",
        options: ["5", "6", "7", "8"],
        correct: "C",
        difficulty: "easy",
        explanation:
            "The 7 base quantities are length, mass, time, electric current, temperature, amount of substance and luminous intensity.",
    },
    {
        chapter: "units-and-measurements",
        topic: "significant-figures",
        text: "The number of significant figures in 0.00450 is",
        options: ["2", "3", "5", "6"],
        correct: "B",
        difficulty: "medium",
        explanation:
            "Leading zeros are not significant. The digits 4, 5 and the trailing 0 after the decimal point are significant, so there are 3.",
    },
    {
        chapter: "units-and-measurements",
        topic: "significant-figures",
        text: "The product 2.5 × 1.25, written with the correct number of significant figures, is",
        options: ["3.125", "3.13", "3.1", "3"],
        correct: "C",
        difficulty: "medium",
        explanation:
            "In multiplication the answer keeps the least number of significant figures in the inputs. 2.5 has 2, so 3.125 becomes 3.1.",
    },
    {
        chapter: "units-and-measurements",
        topic: "dimensional-analysis",
        text: "The dimensional formula of force is",
        options: ["[MLT⁻²]", "[ML²T⁻²]", "[MLT⁻¹]", "[ML⁻¹T⁻²]"],
        correct: "A",
        difficulty: "easy",
        explanation: "Force = mass × acceleration = [M][LT⁻²] = [MLT⁻²].",
    },
    {
        chapter: "units-and-measurements",
        topic: "dimensional-analysis",
        text: "Which pair of quantities has the same dimensions?",
        options: ["Work and torque", "Force and power", "Momentum and energy", "Pressure and force"],
        correct: "A",
        difficulty: "medium",
        explanation: "Work and torque are both force × distance, so both are [ML²T⁻²].",
    },
    {
        chapter: "motion-in-a-straight-line",
        topic: "speed-and-velocity",
        text: "A car covers the first half of a distance at 40 km/h and the second half at 60 km/h. Its average speed is",
        options: ["50 km/h", "48 km/h", "45 km/h", "52 km/h"],
        correct: "B",
        difficulty: "medium",
        explanation:
            "For equal distances, average speed = 2v₁v₂ / (v₁ + v₂) = 2 × 40 × 60 / 100 = 48 km/h.",
    },
    {
        chapter: "motion-in-a-straight-line",
        topic: "acceleration",
        text: "A body starts from rest and accelerates uniformly at 2 m/s². Its velocity after 5 s is",
        options: ["5 m/s", "7 m/s", "10 m/s", "25 m/s"],
        correct: "C",
        difficulty: "easy",
        explanation: "v = u + at = 0 + 2 × 5 = 10 m/s.",
    },
    {
        chapter: "motion-in-a-straight-line",
        topic: "equations-of-motion",
        text: "A ball is dropped from rest. Taking g = 10 m/s², the distance it falls in the first 3 s is",
        options: ["30 m", "45 m", "60 m", "90 m"],
        correct: "B",
        difficulty: "medium",
        explanation: "s = ut + ½gt² = 0 + ½ × 10 × 3² = 45 m.",
    },
    {
        chapter: "motion-in-a-straight-line",
        topic: "equations-of-motion",
        text: "A body moving at 20 m/s decelerates uniformly at 4 m/s². The distance it covers before stopping is",
        options: ["25 m", "40 m", "50 m", "100 m"],
        correct: "C",
        difficulty: "hard",
        explanation: "v² = u² − 2as, so 0 = 400 − 2 × 4 × s, giving s = 50 m.",
    },
];

const seed = async () => {
    await connectDB();

    const exam = await Exam.findOne({ code: "NEET" });
    const subject = await Subject.findOne({ examId: exam._id, slug: "physics" });

    for (const item of questions) {
        const chapter = await Chapter.findOne({ subjectId: subject._id, slug: item.chapter });
        const topic = await Topic.findOne({ chapterId: chapter._id, slug: item.topic });

        if (!chapter || !topic) {
            console.log(`Skipped (topic not found): ${item.text}`);
            continue;
        }

        await Question.findOneAndUpdate(
            { text: item.text }, // match by text so running twice doesn't duplicate
            {
                examId: exam._id,
                subjectId: subject._id,
                chapterId: chapter._id,
                topicId: topic._id,
                type: "mcq_single",
                text: item.text,
                options: item.options.map((text, i) => ({ id: "ABCD"[i], text })),
                correctOptionIds: [item.correct],
                explanation: { text: item.explanation },
                difficulty: item.difficulty,
                source: { kind: "original" },
                status: "published",
            },
            saveOptions
        );
        console.log(`Saved: ${item.text.slice(0, 60)}`);
    }

    console.log("Questions seeded");
    await mongoose.disconnect();
};

seed().catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exit(1);
});