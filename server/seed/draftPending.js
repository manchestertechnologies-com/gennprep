// Finds published questions that are "pending" (not reviewed) in the question website, and makes them drafts.
//   node seed\draftPending.js        -> only shows how many would change
//   node seed\draftPending.js yes    -> changes them to draft
require("dotenv").config();
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const fs = require("fs");
const m = require("mongoose");
const XLSX = require("../../client/node_modules/xlsx");
const QBP = /\s*\[QBP_[A-Z_]+:[^\]]*\]/g;
const norm = (s) => String(s || "").replace(QBP, "").replace(/\s+/g, " ").trim();

(async () => {
  const csv = fs.readFileSync("C:/Examprep/pending_texts.csv", "utf8");
  const wb = XLSX.read(csv, { type: "string", raw: true });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "", raw: false });
  const pending = new Set(rows.map((r) => norm(r.question)).filter(Boolean));
  console.log("Pending questions in the question website:", pending.size);

  await m.connect(process.env.MONGO_URI);
  const db = m.connection.db;
  const exams = new Map((await db.collection("exams").find().toArray()).map((e) => [String(e._id), e.code]));
  const subjects = new Map((await db.collection("subjects").find().toArray()).map((s) => [String(s._id), s.name]));
  const ids = [];
  const count = {};
  const cur = db.collection("questions").find({ status: "published" }, { projection: { text: 1, examId: 1, subjectId: 1 } });
  for await (const q of cur) {
    if (!pending.has(norm(q.text))) continue;
    ids.push(q._id);
    const k = (exams.get(String(q.examId)) || "?").padEnd(6) + (subjects.get(String(q.subjectId)) || "?");
    count[k] = (count[k] || 0) + 1;
  }
  console.log("Published questions that are really pending:");
  for (const [k, n] of Object.entries(count).sort()) console.log("  " + k.padEnd(20), n);
  console.log("  TOTAL".padEnd(22), ids.length);

  if (process.argv[2] === "yes") {
    let changed = 0;
    for (let i = 0; i < ids.length; i += 1000) {
      const r = await db.collection("questions").updateMany({ _id: { $in: ids.slice(i, i + 1000) } }, { $set: { status: "draft" } });
      changed += r.modifiedCount;
    }
    console.log("Changed to draft:", changed);
  } else {
    console.log("Nothing changed yet. Run again with  yes  to make them drafts.");
  }
  await m.disconnect();
})().catch((e) => { console.log("ERROR:", e.message); process.exit(1); });