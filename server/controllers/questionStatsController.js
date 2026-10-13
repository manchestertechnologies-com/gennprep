const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const Question = require("../models/Question");

// GET /api/admin/stats/questions
// How many questions each exam has, per subject (published and drafts)
const questionBreakdown = async (req, res) => {
  try {
    const [exams, subjects, groups] = await Promise.all([
      Exam.find().sort({ order: 1, name: 1 }).lean(),
      Subject.find().sort({ order: 1, name: 1 }).lean(),
      Question.aggregate([{ $group: { _id: { s: "$subjectId", st: "$status" }, n: { $sum: 1 } } }]),
    ]);
    const count = {};
    for (const g of groups) count[String(g._id.s) + "|" + g._id.st] = g.n;
    const result = exams.map((e) => {
      const subs = subjects
        .filter((s) => String(s.examId) === String(e._id))
        .map((s) => ({
          name: s.name,
          published: count[String(s._id) + "|published"] || 0,
          drafts: count[String(s._id) + "|draft"] || 0,
        }));
      return {
        code: e.code,
        name: e.name,
        published: subs.reduce((a, s) => a + s.published, 0),
        drafts: subs.reduce((a, s) => a + s.drafts, 0),
        subjects: subs,
      };
    });
    res.json({ exams: result });
  } catch (error) {
    console.error("questionBreakdown error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server" });
  }
};

module.exports = { questionBreakdown };

// GET /api/admin/syllabus-filters?examId=...
// Subjects, chapters (with class) and topics of one exam, for the question filters
const Chapter = require("../models/Chapter");
const Topic = require("../models/Topic");
const syllabusFilters = async (req, res) => {
  try {
    const { examId } = req.query;
    if (!require("mongoose").isValidObjectId(examId)) return res.status(400).json({ message: "Choose an exam first" });
    const [subjects, chapters, topics] = await Promise.all([
      Subject.find({ examId }).sort({ order: 1, name: 1 }).select("name").lean(),
      Chapter.find({ examId }).sort({ order: 1, name: 1 }).select("name subjectId classLevel").lean(),
      Topic.find({ examId }).sort({ order: 1, name: 1 }).select("name chapterId").lean(),
    ]);
    res.json({ subjects, chapters, topics });
  } catch (error) {
    console.error("syllabusFilters error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server" });
  }
};
module.exports.syllabusFilters = syllabusFilters;