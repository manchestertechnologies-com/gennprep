// Reading and writing the bulk upload spreadsheet (Excel or CSV)
export const COLUMNS = [
  "Subject", "Chapter", "Topic", "Question", "Option A", "Option B", "Option C", "Option D",
  "Correct", "Explanation", "Difficulty", "Type", "Numerical Answer", "Tolerance", "Source", "Year", "Tags",
];

// Column name in the file (any spelling/case) -> field the server expects
const FIELD = {
  subject: "subject", chapter: "chapter", topic: "topic",
  question: "question", questiontext: "question",
  optiona: "optionA", optionb: "optionB", optionc: "optionC", optiond: "optionD",
  correct: "correct", correctanswer: "correct", answer: "correct", correctoption: "correct",
  explanation: "explanation", solution: "explanation",
  difficulty: "difficulty", level: "difficulty", type: "type",
  numericalanswer: "numericalAnswer", numerical: "numericalAnswer", tolerance: "tolerance",
  source: "source", year: "year", tags: "tags",
};
const norm = (h) => String(h).toLowerCase().replace(/[^a-z0-9]/g, "");

// The Excel library is big, so it only loads when needed
const loadXlsx = () => import("xlsx");

const HELP = [
  "How to fill the Questions sheet",
  "1. One question per row. Delete the 2 example rows before uploading.",
  "2. Subject, Chapter and Topic must match the Syllabus sheet (capital letters don't matter).",
  "3. Correct: A, B, C or D. For more than one correct answer (Type = multi) write e.g. A,C",
  "4. Type: single (default), multi or numerical. Numerical: leave options empty, fill Numerical Answer (Tolerance is optional).",
  "5. Difficulty: easy, medium (default) or hard.",
  "6. Maths: put formulas between $ signs, e.g. $\\frac{1}{2}mv^2$",
  "7. Source (optional): original, pyq or ncert. Year is for previous-year questions.",
  "8. Tags (optional): words separated by commas.",
  "9. Images can be added later by editing the question in the admin portal.",
];

export async function downloadTemplate(examCode, syllabusRows) {
  const XLSX = await loadXlsx();
  const s = syllabusRows[0] || { subject: "Physics", chapter: "Kinematics", topic: "Motion in a straight line" };
  const examples = [
    [s.subject, s.chapter, s.topic, "A car starts from rest and speeds up at $2\\,m/s^2$ for 5 s. What is its final speed?",
      "5 m/s", "10 m/s", "20 m/s", "25 m/s", "B", "$v = u + at = 0 + 2 \\times 5 = 10$ m/s", "easy", "single", "", "", "original", "", "kinematics"],
    [s.subject, s.chapter, s.topic, "A ball is dropped from 20 m. Taking $g = 10\\,m/s^2$, how many seconds does it take to reach the ground?",
      "", "", "", "", "", "$h = \\frac{1}{2}gt^2$, so $t = 2$ s", "medium", "numerical", "2", "0", "", "", ""],
  ];

  const wb = XLSX.utils.book_new();
  const questions = XLSX.utils.aoa_to_sheet([COLUMNS, ...examples]);
  questions["!cols"] = COLUMNS.map((c) => ({ wch: c === "Question" || c === "Explanation" ? 50 : 14 }));
  XLSX.utils.book_append_sheet(wb, questions, "Questions");

  const syllabus = XLSX.utils.aoa_to_sheet([["Subject", "Chapter", "Topic"], ...syllabusRows.map((r) => [r.subject, r.chapter, r.topic])]);
  syllabus["!cols"] = [{ wch: 16 }, { wch: 36 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, syllabus, "Syllabus");

  const help = XLSX.utils.aoa_to_sheet(HELP.map((line) => [line]));
  help["!cols"] = [{ wch: 110 }];
  XLSX.utils.book_append_sheet(wb, help, "Help");

  XLSX.writeFile(wb, `ExamPrep-${examCode || "exam"}-questions.xlsx`);
}

// Returns [{ rowNumber, subject, chapter, topic, question, optionA, ... }]
export async function readSheet(file) {
  const XLSX = await loadXlsx();
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array", codepage: 65001 });
  const name = wb.SheetNames.find((n) => n.toLowerCase() === "questions") || wb.SheetNames[0];
  const raw = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: "", raw: false });
  const rows = [];
  raw.forEach((r) => {
    const row = { rowNumber: r.__rowNum__ + 1 }; // the row number you see in Excel
    for (const [header, value] of Object.entries(r)) {
      const field = FIELD[norm(header)];
      if (field) row[field] = String(value).trim();
    }
    if (row.question || row.subject || row.chapter) rows.push(row);
  });
  return rows;
}