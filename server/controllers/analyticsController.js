const mongoose = require("mongoose");
const Progress = require("../models/Progress");
const TestAttempt = require("../models/TestAttempt");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
require("../models/Test"); // so mock test titles can be loaded

const DONE = ["submitted", "auto_submitted"];
const pct = (correct, attempted) => (attempted ? Math.round((correct / attempted) * 100) : 0);
const label = (doc, fallback) => (doc && (doc.name || doc.title)) || fallback;

// "YYYY-MM-DD" in Indian time, daysAgo days before today
const istDay = (daysAgo) => new Date(Date.now() + 5.5 * 3600 * 1000 - daysAgo * 86400 * 1000).toISOString().slice(0, 10);

// GET /api/progress/analytics?examId=...
exports.getAnalytics = async (req, res) => {
  try {
    const { examId } = req.query;
    if (!mongoose.isValidObjectId(examId)) return res.status(400).json({ message: "Please choose an exam first." });
    const userId = req.user._id;

    const [progress, mockDocs, practiceSessions] = await Promise.all([
      Progress.findOne({ userId, examId }).lean(),
      TestAttempt.find({ userId, examId, mode: "mock", status: { $in: DONE } })
        .sort({ submittedAt: 1 })
        .select("testId submittedAt result")
        .populate("testId", "title name")
        .lean(),
      TestAttempt.countDocuments({ userId, examId, mode: { $ne: "mock" }, status: { $in: DONE } }),
    ]);

    const p = progress || { totals: {}, subjects: [], chapters: [], daily: [] };
    const t = p.totals || {};

    const [subjectDocs, chapterDocs] = await Promise.all([
      Subject.find({ _id: { $in: p.subjects.map((s) => s.refId) } }).lean(),
      Chapter.find({ _id: { $in: p.chapters.map((c) => c.refId) } }).lean(),
    ]);
    const subjectById = new Map(subjectDocs.map((s) => [String(s._id), s]));
    const chapterById = new Map(chapterDocs.map((c) => [String(c._id), c]));

    const subjects = p.subjects
      .filter((s) => s.attempted > 0)
      .map((s) => ({
        id: s.refId,
        name: label(subjectById.get(String(s.refId)), "Subject"),
        attempted: s.attempted,
        correct: s.correct,
        accuracy: pct(s.correct, s.attempted),
      }))
      .sort((a, b) => b.attempted - a.attempted);

    // Weakest chapters first
    const chapters = p.chapters
      .filter((c) => c.attempted > 0)
      .map((c) => {
        const doc = chapterById.get(String(c.refId));
        const subject = subjectById.get(String(doc?.subjectId || doc?.subject || ""));
        return {
          id: c.refId,
          name: label(doc, "Chapter"),
          subject: label(subject, ""),
          attempted: c.attempted,
          correct: c.correct,
          accuracy: pct(c.correct, c.attempted),
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted);

    const mocks = mockDocs.map((m, i) => {
      const r = m.result || {};
      return {
        id: m._id,
        title: label(m.testId, "Mock test " + (i + 1)),
        date: m.submittedAt,
        score: r.score || 0,
        maxScore: r.maxScore || 0,
        percentage: Math.round(r.percentage ?? pct(r.score, r.maxScore)),
        rank: r.rank || null,
        percentile: r.percentile ?? null,
      };
    });

    // Last 30 days of practice, oldest first (days with no practice count as 0)
    const byDate = new Map((p.daily || []).map((d) => [d.date, d]));
    const daily = [];
    for (let i = 29; i >= 0; i--) {
      const date = istDay(i);
      const d = byDate.get(date);
      daily.push({ date, attempted: d?.attempted || 0, correct: d?.correct || 0 });
    }

    const ranks = mocks.map((m) => m.rank).filter(Boolean);
    res.json({
      totals: {
        attempted: t.attempted || 0,
        correct: t.correct || 0,
        accuracy: pct(t.correct, t.attempted),
        timeSec: t.timeSec || 0,
        practiceSessions,
        mocksTaken: mocks.length,
        bestRank: ranks.length ? Math.min(...ranks) : null,
      },
      subjects,
      chapters,
      mocks,
      daily,
    });
  } catch (err) {
    console.error("getAnalytics:", err);
    res.status(500).json({ message: "Could not load your analytics." });
  }
};