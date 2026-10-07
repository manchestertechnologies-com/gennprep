const mongoose = require("mongoose");
const Question = require("../models/Question");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");
const Topic = require("../models/Topic");
const { validateQuestion } = require("./questionController");

const MAX_ROWS = 100; // per request; the website sends big files in parts
const clean = (v) => (v === undefined || v === null ? "" : String(v).trim());
const key = (v) => clean(v).toLowerCase().replace(/\s+/g, " ");

const TYPES = {
  "": "mcq_single", single: "mcq_single", mcq_single: "mcq_single",
  multi: "mcq_multi", multiple: "mcq_multi", mcq_multi: "mcq_multi",
  numerical: "numerical", numeric: "numerical", integer: "numerical",
};
const DIFFICULTIES = ["easy", "medium", "hard"];
const SOURCES = ["original", "pyq", "ncert"];

// Loads the exam's syllabus once, so every row can be matched by name
const loadSyllabus = async (examId) => {
  const [subjects, chapters, topics] = await Promise.all([
    Subject.find({ examId }).lean(),
    Chapter.find({ examId }).lean(),
    Topic.find({ examId }).lean(),
  ]);
  return {
    subjects: new Map(subjects.map((s) => [key(s.name), s])),
    chapters: new Map(chapters.map((c) => [c.subjectId + "|" + key(c.name), c])),
    topics: new Map(topics.map((t) => [t.chapterId + "|" + key(t.name), t])),
    list: { subjects, chapters, topics },
  };
};

// Turns one spreadsheet row into question data, or returns { error }
const buildQuestion = (row, syllabus, extra) => {
  const subject = syllabus.subjects.get(key(row.subject));
  if (!subject) return { error: `Subject "${clean(row.subject)}" not found in this exam` };
  const chapter = syllabus.chapters.get(subject._id + "|" + key(row.chapter));
  if (!chapter) return { error: `Chapter "${clean(row.chapter)}" not found in ${subject.name}` };
  const topic = syllabus.topics.get(chapter._id + "|" + key(row.topic));
  if (!topic) return { error: `Topic "${clean(row.topic)}" not found in ${chapter.name}` };

  const type = TYPES[key(row.type)];
  if (!type) return { error: `Type "${clean(row.type)}" must be single, multi or numerical` };
  const difficulty = key(row.difficulty) || "medium";
  if (!DIFFICULTIES.includes(difficulty)) return { error: "Difficulty must be easy, medium or hard" };

  const data = {
    examId: topic.examId,
    subjectId: topic.subjectId,
    chapterId: topic.chapterId,
    topicId: topic._id,
    type,
    text: clean(row.question),
    explanation: { text: clean(row.explanation) },
    difficulty,
    tags: clean(row.tags) ? clean(row.tags).split(",").map((t) => t.trim()).filter(Boolean) : [],
    ...extra,
  };

  if (type === "numerical") {
    const value = Number(clean(row.numericalAnswer));
    if (clean(row.numericalAnswer) === "" || Number.isNaN(value)) return { error: "Numerical questions need a number in Numerical Answer" };
    data.numericalAnswer = { value, tolerance: Number(clean(row.tolerance)) || 0 };
  } else {
    data.options = ["A", "B", "C", "D"].map((id) => ({ id, text: clean(row["option" + id]) }));
    data.correctOptionIds = clean(row.correct).toUpperCase().split(/[\s,;]+/).filter(Boolean);
  }

  const source = key(row.source);
  if (source) {
    if (!SOURCES.includes(source)) return { error: "Source must be original, pyq or ncert" };
    data.source = { kind: source };
    if (clean(row.year)) data.source.year = Number(clean(row.year)) || undefined;
  }

  const error = validateQuestion(data);
  return error ? { error } : { data };
};

// POST /api/admin/questions/bulk
// Body: { examId, status: "published" | "draft", dryRun: true | false, rows: [...] }
// dryRun = only check the rows; otherwise add the good ones.
const bulkImport = async (req, res) => {
  try {
    const { examId, rows, dryRun } = req.body;
    const status = req.body.status === "draft" ? "draft" : "published";
    if (!mongoose.isValidObjectId(examId)) return res.status(400).json({ message: "Choose an exam first" });
    if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ message: "No rows to import" });
    if (rows.length > MAX_ROWS) return res.status(400).json({ message: `Send at most ${MAX_ROWS} rows at a time` });

    const syllabus = await loadSyllabus(examId);
    const extra = { status, createdBy: req.user._id, updatedBy: req.user._id };
    const built = rows.map((row) => ({ rowNumber: row.rowNumber, ...buildQuestion(row, syllabus, extra) }));

    // Skip questions that already exist in the same topic (e.g. the same file uploaded twice)
    const texts = built.filter((b) => b.data).map((b) => b.data.text);
    const existing = await Question.find({ examId, text: { $in: texts }, status: { $ne: "archived" } })
      .select("text topicId")
      .lean();
    const inDatabase = new Set(existing.map((q) => q.topicId + "|" + q.text));
    const inFile = new Set();
    for (const b of built) {
      if (!b.data) continue;
      const k = b.data.topicId + "|" + b.data.text;
      if (inDatabase.has(k)) b.error = "Already exists (same question in this topic)";
      else if (inFile.has(k)) b.error = "Same question appears twice in this file";
      else inFile.add(k);
      if (b.error) delete b.data;
    }

    const good = built.filter((b) => b.data);
    let added = 0;
    if (!dryRun && good.length) {
      const inserted = await Question.insertMany(good.map((b) => b.data), { ordered: false });
      added = inserted.length;
    }

    res.json({
      added,
      results: built.map((b) => ({ rowNumber: b.rowNumber, ok: !b.error, error: b.error || null })),
    });
  } catch (error) {
    console.error("bulkImport error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server" });
  }
};

// GET /api/admin/questions/bulk/syllabus?examId=...
// Every Subject > Chapter > Topic name, for the template's "Syllabus" sheet
const bulkSyllabus = async (req, res) => {
  try {
    const { examId } = req.query;
    if (!mongoose.isValidObjectId(examId)) return res.status(400).json({ message: "Choose an exam first" });
    const { list } = await loadSyllabus(examId);
    const subjectName = new Map(list.subjects.map((s) => [String(s._id), s.name]));
    const chapterById = new Map(list.chapters.map((c) => [String(c._id), c]));
    const rows = list.topics
      .map((t) => {
        const c = chapterById.get(String(t.chapterId));
        return { subject: subjectName.get(String(t.subjectId)) || "", chapter: c ? c.name : "", topic: t.name };
      })
      .sort((a, b) => (a.subject + a.chapter + a.topic).localeCompare(b.subject + b.chapter + b.topic));
    res.json({ rows });
  } catch (error) {
    console.error("bulkSyllabus error:", error.message);
    res.status(500).json({ message: "Something went wrong on the server" });
  }
};

module.exports = { bulkImport, bulkSyllabus };