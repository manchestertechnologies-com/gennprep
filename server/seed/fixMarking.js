// Sets the correct marking rules for each exam, and fixes mock tests that were created with the wrong rules
require("dotenv").config();
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const m = require("mongoose");
const RULES = {
  NEET: { durationMinutes: 180, correct: 4, incorrect: -1 },
  JEE: { durationMinutes: 180, correct: 4, incorrect: -1 },
  KCET: { durationMinutes: 80, correct: 1, incorrect: 0 },
};
(async () => {
  await m.connect(process.env.MONGO_URI);
  const db = m.connection.db;
  const cols = (await db.listCollections().toArray()).map((c) => c.name);
  const testsName = cols.find((c) => /mock|test/i.test(c) && !/attempt/i.test(c));
  for (const [code, r] of Object.entries(RULES)) {
    const exam = await db.collection("exams").findOne({ code });
    if (!exam) { console.log(code, "exam not found"); continue; }
    const scheme = { correct: r.correct, incorrect: r.incorrect, unanswered: 0 };
    await db.collection("exams").updateOne({ _id: exam._id }, { $set: { markingScheme: scheme, durationMinutes: r.durationMinutes } });
    const tests = await db.collection(testsName).find({ examId: exam._id }).toArray();
    let fixed = 0;
    for (const t of tests) {
      const total = (t.totalQuestions || 0) * r.correct;
      const note = `${t.totalQuestions} questions. +${r.correct} for correct, ${r.incorrect ? r.incorrect + " for wrong" : "no negative marking"}.`;
      await db.collection(testsName).updateOne({ _id: t._id }, { $set: { markingScheme: scheme, totalMarks: total, instructions: note } });
      fixed++;
    }
    console.log(code.padEnd(5), `+${r.correct} / ${r.incorrect}`, " mock tests fixed:", fixed);
  }
  await m.disconnect();
})().catch((e) => { console.log("ERROR:", e.message); process.exit(1); });