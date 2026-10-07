// Loads the full NCERT-based syllabus (subjects, chapters, topics) for NEET, JEE and KCET.
// Safe to run more than once: anything that already exists (same name) is kept as it is.
//   node seed\loadSyllabus.js        -> only shows what would be added
//   node seed\loadSyllabus.js yes    -> adds it
require("dotenv").config();
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");

const { PHYSICS } = require("./syllabusPhysics");
const { CHEMISTRY, MATHS } = require("./syllabusChemMaths");
const { BIOLOGY } = require("./syllabusBiology");

const EXAMS = {
  NEET: { Physics: PHYSICS, Chemistry: CHEMISTRY, Biology: BIOLOGY },
  JEE: { Physics: PHYSICS, Chemistry: CHEMISTRY, Mathematics: MATHS },
  KCET: { Physics: PHYSICS, Chemistry: CHEMISTRY, Mathematics: MATHS, Biology: BIOLOGY },
};
// Existing subjects with these names count as the same subject
const ALIASES = { mathematics: ["maths", "math", "mathematics"] };

const key = (s) => String(s).trim().toLowerCase().replace(/\s+/g, " ");
const slugify = (s) => String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function run(db, apply) {
  const col = (n) => db.collection(n);
  const now = new Date();
  const total = { subjects: 0, chapters: 0, topics: 0 };

  const exams = await col("exams").find({}).toArray();
  for (const [code, subjects] of Object.entries(EXAMS)) {
    const exam = exams.find((e) => key(e.code) === key(code));
    if (!exam) { console.log(`${code}: exam not found, skipped`); continue; }
    const added = { subjects: 0, chapters: 0, topics: 0 };

    const existingSubjects = await col("subjects").find({ examId: exam._id }).toArray();
    let sOrder = existingSubjects.length;
    for (const [subjectName, chapters] of Object.entries(subjects)) {
      const names = ALIASES[key(subjectName)] || [key(subjectName)];
      let subject = existingSubjects.find((s) => names.includes(key(s.name)) || s.slug === slugify(subjectName));
      if (!subject) {
        subject = { _id: new mongoose.Types.ObjectId(), examId: exam._id, name: subjectName, slug: slugify(subjectName),
          order: ++sOrder, questionCount: 0, isActive: true, createdAt: now, updatedAt: now };
        if (apply) await col("subjects").insertOne(subject);
        added.subjects++;
      }

      const existingChapters = subject.createdAt === now && !apply ? [] : await col("chapters").find({ subjectId: subject._id }).toArray();
      let cOrder = existingChapters.length;
      for (const [classLevel, chapterName, topicList] of chapters) {
        let chapter = existingChapters.find((c) => key(c.name) === key(chapterName) || c.slug === slugify(chapterName));
        if (!chapter) {
          chapter = { _id: new mongoose.Types.ObjectId(), examId: exam._id, subjectId: subject._id, name: chapterName,
            slug: slugify(chapterName), classLevel, weightage: 0, order: ++cOrder, questionCount: 0, isActive: true, createdAt: now, updatedAt: now };
          if (apply) await col("chapters").insertOne(chapter);
          added.chapters++;
        }

        const existingTopics = chapter.createdAt === now && !apply ? [] : await col("topics").find({ chapterId: chapter._id }).toArray();
        let tOrder = existingTopics.length;
        for (const topicName of topicList.split("|").map((t) => t.trim())) {
          if (existingTopics.some((t) => key(t.name) === key(topicName) || t.slug === slugify(topicName))) continue;
          const topic = { _id: new mongoose.Types.ObjectId(), examId: exam._id, subjectId: subject._id, chapterId: chapter._id,
            name: topicName, slug: slugify(topicName), order: ++tOrder, questionCount: 0, isActive: true, createdAt: now, updatedAt: now };
          if (apply) await col("topics").insertOne(topic);
          existingTopics.push(topic);
          added.topics++;
        }
      }
    }
    console.log(`${code.padEnd(5)} new: ${added.subjects} subjects, ${added.chapters} chapters, ${added.topics} topics`);
    for (const k in total) total[k] += added[k];
  }
  console.log(`TOTAL new: ${total.subjects} subjects, ${total.chapters} chapters, ${total.topics} topics`);
  console.log(apply ? "\nDone! The syllabus has been added." : "\nNothing added yet. To add it, run:  node seed\\loadSyllabus.js yes");
}

if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => run(mongoose.connection.db, process.argv[2] === "yes"))
    .then(() => process.exit(0))
    .catch((err) => { console.log("Error: " + err.message); process.exit(1); });
}
module.exports = { run, EXAMS };