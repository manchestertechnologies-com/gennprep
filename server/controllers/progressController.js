const mongoose = require("mongoose");
const Progress = require("../models/Progress");
const TestAttempt = require("../models/TestAttempt");
const Chapter = require("../models/Chapter");
const Subject = require("../models/Subject");
const { istDate } = require("../utils/updateProgress");

const DAY_MS = 24 * 60 * 60 * 1000;

// A chapter needs at least this many answered questions before we call it
// weak or strong. 3 is low so you can test it now; raise it to 20 later.
const MIN_ATTEMPTS = 3;
const WEAK_BELOW = 50; // accuracy % below this = weak
const STRONG_FROM = 80; // accuracy % from this = strong

const round2 = (n) => Math.round(n * 100) / 100;

// Turns a list of stats into [{ id, name, attempted, correct, accuracy }]
const withNames = async (stats, Model) => {
    const ids = stats.map((s) => s.refId);
    const docs = await Model.find({ _id: { $in: ids } }).select("name").lean();
    const nameById = new Map(docs.map((d) => [String(d._id), d.name]));
    return stats.map((s) => ({
        id: s.refId,
        name: nameById.get(String(s.refId)) || "Unknown",
        attempted: s.attempted,
        correct: s.correct,
        accuracy: s.accuracy,
    }));
};

// GET /api/progress/dashboard?examId=...
const getDashboard = async (req, res) => {
    try {
        const { examId } = req.query;
        if (!mongoose.isValidObjectId(examId)) {
            return res.status(400).json({ message: "A valid examId is required" });
        }

        const userId = req.user._id;

        const [progress, recent] = await Promise.all([
            Progress.findOne({ userId, examId }).lean(),
            TestAttempt.find({ userId, examId, status: { $in: ["submitted", "auto_submitted"] } })
                .sort({ submittedAt: -1 })
                .limit(5)
                .select("mode submittedAt result.score result.maxScore result.accuracy result.correct result.incorrect result.unanswered")
                .lean(),
        ]);

        const totals = progress?.totals || {
            attempted: 0,
            correct: 0,
            incorrect: 0,
            timeSec: 0,
            testsTaken: 0,
        };
        const accuracy = totals.attempted ? round2((totals.correct / totals.attempted) * 100) : 0;

        // Chapters and subjects with their names
        const chapters = await withNames(progress?.chapters || [], Chapter);
        const subjects = await withNames(progress?.subjects || [], Subject);

        const eligible = chapters.filter((c) => c.attempted >= MIN_ATTEMPTS);
        const weakChapters = eligible
            .filter((c) => c.accuracy < WEAK_BELOW)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5);
        const strongChapters = eligible
            .filter((c) => c.accuracy >= STRONG_FROM)
            .sort((a, b) => b.accuracy - a.accuracy)
            .slice(0, 5);

        // Recommended practice = the 3 weakest chapters
        const recommended = weakChapters.slice(0, 3).map((c) => ({
            chapterId: c.id,
            name: c.name,
            reason: `Accuracy ${c.accuracy}%: practise this chapter again`,
        }));

        // Last 7 days, oldest first, with 0 for days without practice
        const now = new Date();
        const dailyByDate = new Map((progress?.daily || []).map((d) => [d.date, d]));
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = istDate(new Date(now.getTime() - i * DAY_MS));
            const d = dailyByDate.get(date);
            last7Days.push({
                date,
                attempted: d ? d.attempted : 0,
                correct: d ? d.correct : 0,
            });
        }

        // Streak: if they skipped yesterday AND today, the streak is broken
        const streak = req.user.streak || { current: 0, longest: 0 };
        const lastDay = streak.lastActiveDate ? istDate(new Date(streak.lastActiveDate)) : null;
        const today = istDate(now);
        const yesterday = istDate(new Date(now.getTime() - DAY_MS));
        const currentStreak = lastDay === today || lastDay === yesterday ? streak.current : 0;

        res.json({
            welcome: `Welcome back, ${req.user.name}`,
            totals: { ...totals, accuracy },
            streak: { current: currentStreak, longest: streak.longest || 0 },
            weakChapters,
            strongChapters,
            recommended,
            subjects,
            last7Days,
            wrongQuestionsCount: progress?.wrongQuestionIds?.length || 0,
            recentTests: recent.map((t) => ({
                attemptId: t._id,
                mode: t.mode,
                submittedAt: t.submittedAt,
                score: t.result?.score,
                maxScore: t.result?.maxScore,
                accuracy: t.result?.accuracy,
            })),
        });
    } catch (error) {
        console.error("getDashboard error:", error.message);
        res.status(500).json({ message: "Something went wrong on the server" });
    }
};

module.exports = { getDashboard };