// Converts a row exported from the question website (Supabase CSV) into ExamPrep's bulk upload row

const clean = (v) => (v === undefined || v === null ? "" : String(v).trim());
const parseJson = (v, fallback) => {
  try {
    const x = JSON.parse(clean(v));
    return x ?? fallback;
  } catch {
    return fallback;
  }
};

// Standard options used when an assertion-reason question has none of its own
const AR_OPTIONS = [
  "Both A and R are true and R is the correct explanation of A",
  "Both A and R are true but R is not the correct explanation of A",
  "A is true but R is false",
  "A is false but R is true",
];

// True when the file looks like the question website's export
export const isSupabaseExport = (headers) => headers.includes("q_type") && headers.includes("opt_a") && headers.includes("correct_option");

const asList = (v) => {
  const x = parseJson(v, []);
  if (Array.isArray(x)) return x.map((i) => (typeof i === "object" && i ? i.text || i.value || i.label || JSON.stringify(i) : String(i)));
  if (x && typeof x === "object") return Object.values(x).map(String);
  return [];
};

// Returns { row } ready for upload, or { skip: "reason" }
export function convertRow(r, rowNumber) {
  const type = clean(r.q_type).toLowerCase();
  const exams = parseJson(r.exams, []).map((e) => String(e).toUpperCase());
  let question = clean(r.question);
  let options = [r.opt_a, r.opt_b, r.opt_c, r.opt_d].map(clean);
  const base = { rowNumber, exams, subject: clean(r.subject), chapter: clean(r.chapter), topic: clean(r.topic), explanation: clean(r.solution_text), tags: type };

  if (type === "numerical" || type === "integer") {
    const answer = clean(r.num_answer).replace(/[$\s]/g, "");
    if (!answer || Number.isNaN(Number(answer))) return { ...base, question, skip: "Numerical answer is not a number (written answer), can't be marked automatically" };
    return { ...base, question, type: "numerical", numericalAnswer: answer };
  }

  if (type.includes("assert")) {
    const parts = [question, clean(r.assertion) && `**Assertion (A):** ${clean(r.assertion)}`, clean(r.reason) && `**Reason (R):** ${clean(r.reason)}`].filter(Boolean);
    question = parts.join("\n\n").replace(/\*\*/g, "");
    if (!options.some(Boolean)) {
      const predef = asList(r.predef_options);
      options = predef.length >= 4 ? predef.slice(0, 4) : AR_OPTIONS;
    }
  } else if (type.includes("match")) {
    const listA = asList(r.column_a);
    const listB = asList(r.column_b);
    const rows = [];
    if (listA.length) rows.push("List I:", ...listA.map((x, i) => `(${"PQRSTU"[i] || i + 1}) ${x}`));
    if (listB.length) rows.push("", "List II:", ...listB.map((x, i) => `(${i + 1}) ${x}`));
    if (rows.length) question = [question, rows.join("\n")].filter(Boolean).join("\n\n");
    if (!options.some(Boolean)) {
      const mo = parseJson(r.match_options, {});
      const vals = Array.isArray(mo) ? mo.map(String) : ["A", "B", "C", "D"].map((k) => clean(mo[k] ?? mo[k.toLowerCase()]));
      options = vals.slice(0, 4);
    }
  }

  if (!question) return { ...base, skip: "Question text is empty" };
  if (options.filter(Boolean).length < 4) return { ...base, question, skip: `Needs 4 options for a ${type || "MCQ"} question` };
  const correct = clean(r.correct_option).toUpperCase().replace(/[^A-D,]/g, "");
  if (!correct) return { ...base, question, skip: "Correct option is missing" };

  return {
    ...base,
    question,
    type: correct.includes(",") || type.includes("multi") ? "multi" : "single",
    optionA: options[0],
    optionB: options[1],
    optionC: options[2],
    optionD: options[3],
    correct,
  };
}