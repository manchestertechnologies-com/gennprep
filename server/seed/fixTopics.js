// Makes each chapter's topics match the NCERT book exactly, and moves questions to the right topic.
//   node seed\fixTopics.js        -> only shows what would change
//   node seed\fixTopics.js yes    -> makes the changes
// The list of chapters and topics is in C:\Examprep\topicplan.json
require("dotenv").config();
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const fs = require("fs");
const m = require("mongoose");

const key = (v) => String(v || "").toLowerCase().replace(/[\u2018\u2019'`]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
const slugify = (s) => key(s).replace(/ /g, "-") || "topic";
const STOP = ["and", "the", "for", "with", "its", "law", "laws", "of", "in", "on", "a", "an", "to", "by"];
const words = (s) => new Set(key(s).split(" ").filter((w) => w.length > 2 && !STOP.includes(w)).map((w) => w.replace(/s$/, "")));
// 1 = every word of the shorter name is in the other; needs 2 shared words unless the name is one word
const similarity = (a, b) => {
  if (key(a) === key(b)) return 2;
  const A = words(a), B = words(b);
  if (!A.size || !B.size) return 0;
  let same = 0;
  for (const w of A) if (B.has(w)) same++;
  if (same < Math.min(2, A.size, B.size)) return 0;
  return same / Math.min(A.size, B.size);
};

const jac = (a, b) => { const A = words(a), B = words(b); if (!A.size || !B.size) return 0; let s = 0; for (const w of A) if (B.has(w)) s++; return s / new Set([...A, ...B]).size; };
(async () => {
  const plan = JSON.parse(fs.readFileSync("C:/Examprep/topicplan.json", "utf8"));
  const apply = process.argv[2] === "yes";
  await m.connect(process.env.MONGO_URI);
  const db = m.connection.db;
  const Exams = db.collection("exams"), Subjects = db.collection("subjects"), Chapters = db.collection("chapters");
  const Topics = db.collection("topics"), Questions = db.collection("questions");
  const SUBJECT_ALIASES = { maths: "mathematics", math: "mathematics" };
  const sKeyOf = (n) => SUBJECT_ALIASES[key(n)] || key(n);
  let totalMoved = 0;

  for (const exam of await Exams.find().toArray()) {
    const subjects = await Subjects.find({ examId: exam._id }).toArray();
    for (const subject of subjects) {
      const items = plan.chapters.filter((i) => sKeyOf(i.subject) === sKeyOf(subject.name));
      if (!items.length) continue;
      const chapters = await Chapters.find({ subjectId: subject._id }).toArray();
      const chapterOf = (name) => chapters.find((c) => key(c.name) === key(name));
      const bookTopics = []; // every book topic of this subject: { chapter, name, order }
      for (const it of items) { const c = chapterOf(it.chapter); if (c) it.topics.forEach((n, i) => bookTopics.push({ chapter: c, name: n, order: i + 1 })); }

      // Find (or create) a book topic's id
      const topicId = async (chapter, name, order) => {
        const t = await Topics.findOne({ chapterId: chapter._id, name });
        if (t) return t._id;
        const all = await Topics.find({ chapterId: chapter._id }).toArray();
        const same = all.find((x) => key(x.name) === key(name));
        if (same) return same._id;
        let slug = slugify(name), n = 2;
        while (await Topics.findOne({ chapterId: chapter._id, slug })) slug = slugify(name) + "-" + n++;
        return (await Topics.insertOne({ examId: exam._id, subjectId: subject._id, chapterId: chapter._id, name, slug, order, questionCount: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() })).insertedId;
      };

      for (const item of items) {
        const chapter = chapterOf(item.chapter);
        if (!chapter) { console.log(`${exam.code}: chapter "${item.chapter}" not found, skipped`); continue; }
        console.log(`\n${exam.code} · ${subject.name} · ${chapter.name}`);
        const wanted = item.topics;
        const moves = item.move || {};
        const existing = await Topics.find({ chapterId: chapter._id }).toArray();

        // 1. Book topics: rename a matching one, or create it
        for (const [i, name] of wanted.entries()) {
          const found = existing.find((t) => key(t.name) === key(name));
          if (found && found.name !== name) console.log(`  rename  "${found.name}" -> "${name}"`);
          if (!found) console.log(`  create  "${name}"`);
          if (!apply) continue;
          if (found) await Topics.updateOne({ _id: found._id }, { $set: { name, order: i + 1 } });
          else await topicId(chapter, name, i + 1);
        }

        // 2. Every other topic: move its questions, then remove it
        for (const t of existing) {
          if (wanted.some((w) => key(w) === key(t.name))) continue;
          const n = await Questions.countDocuments({ topicId: t._id });
          let dest = moves[t.name] || Object.entries(moves).find(([k]) => key(k) === key(t.name))?.[1];
          let destChapter = chapter, destName = dest;

          if (!dest) {
            // A topic named like the whole chapter is too general: sort its questions
            if (key(t.name) === key(chapter.name) || jac(t.name, chapter.name) >= 0.75) dest = "*auto*";
            else {
              // Best book topic in this chapter, or a clearly matching one in another chapter
              let best = null, score = 0, elsewhere = null;
              for (const b of bookTopics) {
                const s = similarity(t.name, b.name);
                if (b.chapter._id.equals(chapter._id)) { if (s > score) { score = s; best = b; } }
                else if (s === 2 && !elsewhere) elsewhere = b; // same name in another chapter
              }
              // Another chapter only when nothing in this chapter matches
              if (score < 0.75 && elsewhere) { best = elsewhere; score = 2; }
              if (best && score >= 0.75) { destChapter = best.chapter; destName = best.name; dest = best.name; }
              else dest = "*auto*";
            }
          } else if (dest.includes(">")) {
            const [cName, tName] = dest.split(">").map((s) => s.trim());
            destChapter = chapterOf(cName);
            destName = tName;
            if (!destChapter) { console.log(`  ??      "${t.name}": chapter "${cName}" not found, left as it is`); continue; }
          }

          if (dest === "*auto*") {
            // Sort each question into the book topic whose words it mentions most (else Introduction)
            const qs = await Questions.find({ topicId: t._id }, { projection: { text: 1 } }).toArray();
            const groups = {};
            for (const q of qs) {
              const txt = key(q.text);
              let bestName = wanted[0], best = 0;
              for (const w of wanted) {
                const ws = [...words(w)];
                const s = ws.filter((x) => txt.includes(x.slice(0, 5))).length / (ws.length || 1);
                if (s > best) { best = s; bestName = w; }
              }
              (groups[bestName] = groups[bestName] || []).push(q._id);
            }
            for (const [name, ids] of Object.entries(groups)) {
              console.log(`  auto    "${t.name}": ${ids.length} questions -> "${name}"`);
              totalMoved += ids.length;
              if (apply) await Questions.updateMany({ _id: { $in: ids } }, { $set: { topicId: await topicId(chapter, name, wanted.indexOf(name) + 1) } });
            }
            if (!qs.length) console.log(`  remove  "${t.name}" (no questions)`);
            if (apply) await Topics.deleteOne({ _id: t._id });
            continue;
          }

          const other = destChapter._id.equals(chapter._id) ? "" : `${destChapter.name} > `;
          console.log(`  move    "${t.name}" (${n} questions) -> ${other}"${destName}"`);
          totalMoved += n;
          if (!apply) continue;
          const order = (bookTopics.find((b) => b.chapter._id.equals(destChapter._id) && b.name === destName) || {}).order || 99;
          const id = await topicId(destChapter, destName, order);
          await Questions.updateMany({ topicId: t._id }, { $set: { topicId: id, chapterId: destChapter._id } });
          await Topics.deleteOne({ _id: t._id });
        }
      }
    }
  }
  console.log(`\nQuestions moved to a book topic: ${totalMoved}`);
  console.log(apply ? "Done. Changes saved." : "Nothing changed yet. Run again with  yes  to make these changes.");
  await m.disconnect();
})().catch((e) => { console.log("ERROR:", e.message); process.exit(1); });