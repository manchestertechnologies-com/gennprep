// Creates the NEET, JEE and KCET exams in a new, empty database (skips any that already exist)
require("dotenv").config();
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");
const Exam = require("../models/Exam");

const EXAMS = [
  { code: "NEET", name: "NEET UG" },
  { code: "JEE", name: "JEE Main" },
  { code: "KCET", name: "KCET" },
];
const guessNumber = (p) => (/duration|minute|time/i.test(p) ? 180 : /mark|total/i.test(p) ? 720 : 1);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Exam fields:", Object.keys(Exam.schema.paths).filter((p) => !["_id", "__v"].includes(p)).join(", "));
  for (const e of EXAMS) {
    if (await Exam.findOne({ code: e.code })) { console.log(e.code, "already exists"); continue; }
    const doc = new Exam(e);
    for (const [path, type] of Object.entries(Exam.schema.paths)) {
      if (!type.isRequired || doc.get(path) !== undefined || ["_id", "__v"].includes(path)) continue;
      let v;
      if (type.enumValues && type.enumValues.length) v = type.enumValues[0];
      else if (type.instance === "String") v = /slug/i.test(path) ? e.code.toLowerCase() : e.name;
      else if (type.instance === "Number") v = guessNumber(path);
      else if (type.instance === "Boolean") v = true;
      else if (type.instance === "Date") v = new Date();
      if (v !== undefined) doc.set(path, v);
    }
    await doc.save();
    console.log("Created", e.code);
  }
  await mongoose.disconnect();
})().catch((err) => { console.log("ERROR:", err.message); process.exit(1); });