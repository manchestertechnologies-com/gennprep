// Removes the hidden [QBP_...] notes from imported questions and uses [QBP_DIFFICULTY:...] to set difficulty
require("dotenv").config();
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const m = require("mongoose");
const TAG = /\s*\[QBP_[A-Z_]+:[^\]]*\]/g;

(async () => {
  await m.connect(process.env.MONGO_URI);
  const q = m.connection.db.collection("questions");
  const cur = q.find({ $or: [{ "explanation.text": /\[QBP_/ }, { text: /\[QBP_/ }] }, { projection: { text: 1, explanation: 1 } });
  let ops = [], n = 0;
  const count = {};
  for await (const doc of cur) {
    const ex = (doc.explanation && doc.explanation.text) || "";
    const found = ex.match(/\[QBP_DIFFICULTY:\s*([A-Za-z]+)/);
    const set = { "explanation.text": ex.replace(TAG, "").trim(), text: String(doc.text || "").replace(TAG, "").trim() };
    const diff = found && found[1].toLowerCase();
    if (["easy", "medium", "hard"].includes(diff)) { set.difficulty = diff; count[diff] = (count[diff] || 0) + 1; }
    ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: set } } });
    n++;
    if (ops.length === 500) { await q.bulkWrite(ops); ops = []; }
  }
  if (ops.length) await q.bulkWrite(ops);
  console.log("Questions cleaned:", n, " Difficulty set:", JSON.stringify(count));
  await m.disconnect();
})().catch((e) => { console.log("ERROR:", e.message); process.exit(1); });