require("dotenv").config();
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");

const REMOVE = ["botany", "zoology"];
const reallyDelete = process.argv[2] === "yes";

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const exams = await db.collection("exams").find({}).toArray();
  const examCode = new Map(exams.map((e) => [String(e._id), e.code]));
  const subjects = (await db.collection("subjects").find({}).toArray()).filter((s) => REMOVE.includes(s.name.trim().toLowerCase()));

  if (subjects.length === 0) { console.log("No Botany or Zoology subjects found. Nothing to do."); process.exit(0); }

  for (const s of subjects) {
    const chapters = await db.collection("chapters").countDocuments({ subjectId: s._id });
    const topics = await db.collection("topics").countDocuments({ subjectId: s._id });
    const questions = await db.collection("questions").countDocuments({ subjectId: s._id });
    console.log(`${examCode.get(String(s.examId)) || "?"} > ${s.name}: ${chapters} chapters, ${topics} topics, ${questions} questions`);

    if (!reallyDelete) continue;
    if (questions > 0) { console.log("   SKIPPED: it still has questions. Move or delete those questions first."); continue; }
    await db.collection("topics").deleteMany({ subjectId: s._id });
    await db.collection("chapters").deleteMany({ subjectId: s._id });
    await db.collection("subjects").deleteOne({ _id: s._id });
    console.log("   Deleted.");
  }
  if (!reallyDelete) console.log("\nNothing deleted yet. To delete, run:  node seed\\removeSubjects.js yes");
  process.exit(0);
}).catch((err) => { console.log("Error: " + err.message); process.exit(1); });