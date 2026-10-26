import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import { useExam } from "../../context/ExamContext";
import { Bone } from "../../components/Skeleton";

const TABS = [
  { key: "practice", label: "Practice" },
  { key: "mock", label: "Mock tests" },
];

const tone = (p) => (p >= 75 ? "text-emerald-600 bg-emerald-50" : p >= 50 ? "text-amber-700 bg-amber-50" : "text-red-600 bg-red-50");
const barTone = (p) => (p >= 75 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-red-500");
const round = (n) => Math.round((n || 0) * 10) / 10;
const when = (d) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const mins = (s) => {
  const m = Math.round((s || 0) / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
};

function Tile({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Bar({ value }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className={`h-2 rounded-full ${barTone(value)}`} style={{ width: `${Math.max(Math.min(value, 100), 2)}%` }} />
    </div>
  );
}

// Marks of one test, split by subject and by chapter
function TestDetail({ test }) {
  return (
    <div className="border-t border-slate-100 px-4 pb-5 pt-4 md:px-5">
      <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-5">
        <div className="rounded-xl bg-slate-50 py-2"><p className="text-xs text-slate-500">Correct</p><p className="font-bold text-emerald-600">{test.correct}</p></div>
        <div className="rounded-xl bg-slate-50 py-2"><p className="text-xs text-slate-500">Wrong</p><p className="font-bold text-red-600">{test.incorrect}</p></div>
        <div className="rounded-xl bg-slate-50 py-2"><p className="text-xs text-slate-500">Skipped</p><p className="font-bold text-slate-600">{test.unanswered}</p></div>
        <div className="rounded-xl bg-slate-50 py-2"><p className="text-xs text-slate-500">Accuracy</p><p className="font-bold text-slate-900">{round(test.accuracy)}%</p></div>
        <div className="col-span-2 rounded-xl bg-slate-50 py-2 sm:col-span-1"><p className="text-xs text-slate-500">Time</p><p className="font-bold text-slate-900">{mins(test.timeTakenSec)}</p></div>
      </div>

      {test.subjects.length > 0 && (
        <>
          <h4 className="mt-5 text-sm font-semibold text-slate-900">Marks by subject</h4>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="py-2 pr-3 font-medium">Subject</th>
                  <th className="py-2 pr-3 text-right font-medium">Marks</th>
                  <th className="py-2 pr-3 text-right font-medium">Correct</th>
                  <th className="py-2 pr-3 text-right font-medium">Wrong</th>
                  <th className="py-2 pr-3 text-right font-medium">Skipped</th>
                  <th className="py-2 text-right font-medium">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {test.subjects.map((s) => (
                  <tr key={s.name} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-slate-800">{s.name}</td>
                    <td className="py-2.5 pr-3 text-right font-semibold text-slate-900">{s.score}</td>
                    <td className="py-2.5 pr-3 text-right text-emerald-600">{s.correct}</td>
                    <td className="py-2.5 pr-3 text-right text-red-600">{s.incorrect}</td>
                    <td className="py-2.5 pr-3 text-right text-slate-500">{s.unanswered}</td>
                    <td className="py-2.5 text-right">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tone(s.accuracy)}`}>{round(s.accuracy)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {test.chapters.length > 0 && (
        <>
          <h4 className="mt-5 text-sm font-semibold text-slate-900">Chapters</h4>
          <ul className="mt-2 space-y-3">
            {test.chapters.map((c) => (
              <li key={c.subject + c.name}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-slate-800">
                    {c.name}
                    <span className="ml-2 text-xs text-slate-400">{c.subject}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {c.correct}/{c.attempted} correct - <b className="text-slate-800">{round(c.accuracy)}%</b>
                  </span>
                </div>
                <div className="mt-1.5">
                  <Bar value={c.accuracy} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Link to={`/result/${test.attemptId}`} className="mt-5 inline-block text-sm font-semibold text-indigo-600 hover:underline">
        See every question and answer &rarr;
      </Link>
    </div>
  );
}

export default function Analytics() {
  const { examId, exam } = useExam();
  const [tab, setTab] = useState("practice");
  const [data, setData] = useState({}); // tab -> tests
  const [open, setOpen] = useState(null);
  const [subject, setSubject] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!examId) return;
    TABS.forEach((t) =>
      api
        .get("/progress/history", { params: { examId, mode: t.key } })
        .then((res) => setData((d) => ({ ...d, [t.key]: res.data.tests })))
        .catch((err) => setError(getErrorMessage(err)))
    );
  }, [examId]);

  const allTests = data[tab];

  // Subject buttons (Physics, Chemistry, Biology, Maths) found in these tests
  const ORDER = ["physics", "chemistry", "biology", "mathematics", "maths"];
  const subjectNames = useMemo(() => {
    const names = [...new Set((allTests || []).flatMap((t) => t.subjects.map((s) => s.name)))];
    const rank = (n) => {
      const i = ORDER.indexOf(n.toLowerCase());
      return i < 0 ? 99 : i;
    };
    return names.sort((x, y) => rank(x) - rank(y) || x.localeCompare(y));
  }, [allTests]); // eslint-disable-line react-hooks/exhaustive-deps

  // With a subject chosen, each test shows only that subject's marks
  const tests = useMemo(() => {
    if (!allTests) return allTests;
    if (subject === "all") return allTests;
    return allTests
      .map((t) => {
        const s = t.subjects.find((x) => x.name === subject);
        if (!s) return null;
        const questions = t.correct + t.incorrect + t.unanswered || 1;
        const maxScore = Math.round((t.maxScore * s.total) / questions);
        return {
          ...t,
          score: s.score,
          maxScore,
          percentage: maxScore ? (s.score / maxScore) * 100 : 0,
          correct: s.correct,
          incorrect: s.incorrect,
          unanswered: s.unanswered,
          accuracy: s.accuracy,
          subjects: [s],
          chapters: t.chapters.filter((c) => c.subject === subject),
        };
      })
      .filter(Boolean);
  }, [allTests, subject]);

  // Totals and subject accuracy across all tests in this tab
  const summary = useMemo(() => {
    if (!tests || tests.length === 0) return null;
    const attempted = tests.reduce((a, t) => a + t.correct + t.incorrect, 0);
    const correct = tests.reduce((a, t) => a + t.correct, 0);
    const avg = tests.reduce((a, t) => a + (t.percentage || 0), 0) / tests.length;
    const best = Math.max(...tests.map((t) => t.percentage || 0));
    const bySubject = new Map();
    tests.forEach((t) =>
      t.subjects.forEach((s) => {
        const x = bySubject.get(s.name) || { name: s.name, correct: 0, attempted: 0 };
        x.correct += s.correct;
        x.attempted += s.correct + s.incorrect;
        bySubject.set(s.name, x);
      })
    );
    const subjects = subjectNames
      .filter((n) => bySubject.has(n))
      .map((n) => bySubject.get(n))
      .map((s) => ({ ...s, accuracy: s.attempted ? (s.correct / s.attempted) * 100 : 0 }));
    return { attempted, correct, avg, best, accuracy: attempted ? (correct / attempted) * 100 : 0, subjects };
  }, [tests, subjectNames]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
      <p className="mt-1 text-slate-500">Your {exam?.code || ""} results, test by test</p>

      {/* Two options */}
      <div className="mt-6 grid grid-cols-2 gap-3" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => {
              setTab(t.key);
              setOpen(null);
              setSubject("all");
            }}
            className={`rounded-2xl border-2 px-4 py-4 text-left transition ${
              tab === t.key ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className={`block text-base font-bold ${tab === t.key ? "text-indigo-700" : "text-slate-900"}`}>{t.label}</span>
            <span className="block text-xs text-slate-500">{data[t.key] ? `${data[t.key].length} tests taken` : "Loading..."}</span>
          </button>
        ))}
      </div>

      {/* Subject buttons */}
      {subjectNames.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Subject">
          {["all", ...subjectNames].map((name) => (
            <button
              key={name}
              onClick={() => {
                setSubject(name);
                setOpen(null);
              }}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                subject === name ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-300 text-slate-600 hover:border-slate-400"
              }`}
            >
              {name === "all" ? "All subjects" : name}
            </button>
          ))}
        </div>
      )}

      {error && <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!tests && !error && (
        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <Bone key={i} className="h-20" />)}</div>
          <Bone className="h-40" />
        </div>
      )}

      {tests && tests.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-semibold text-slate-900">
            No {tab === "mock" ? "mock tests" : "practice tests"} {subject === "all" ? "yet" : `with ${subject} yet`}
          </p>
          <p className="mt-1 text-sm text-slate-500">Finish one and your marks will show here.</p>
          <Link
            to={tab === "mock" ? "/mock-tests" : "/practice"}
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {tab === "mock" ? "Take a mock test" : "Start practice"}
          </Link>
        </div>
      )}

      {summary && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Tile label="Tests taken" value={tests.length} />
            <Tile label="Average score" value={`${round(summary.avg)}%`} sub={`Best ${round(summary.best)}%`} />
            <Tile label="Accuracy" value={`${round(summary.accuracy)}%`} sub="correct of attempted" />
            <Tile label="Questions answered" value={summary.attempted} sub={`${summary.correct} correct`} />
          </div>

          {subject === "all" && summary.subjects.length > 0 && (
            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-semibold text-slate-900">Accuracy by subject</h2>
              <div className="mt-4 space-y-4">
                {summary.subjects.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{s.name}</span>
                      <span className="text-slate-500">
                        {s.correct}/{s.attempted} - <b className="text-slate-900">{round(s.accuracy)}%</b>
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <Bar value={s.accuracy} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <h2 className="mt-8 font-semibold text-slate-900">
            {tab === "mock" ? "Your mock tests" : "Your practice tests"}
            {subject !== "all" ? ` - ${subject}` : ""}
          </h2>
          <p className="text-xs text-slate-500">Tap a test to see marks by subject and chapter.</p>
          <div className="mt-3 space-y-3">
            {tests.map((t) => {
              const isOpen = open === t.attemptId;
              return (
                <article key={t.attemptId} className={`overflow-hidden rounded-2xl border bg-white ${isOpen ? "border-indigo-300" : "border-slate-200"}`}>
                  <button
                    onClick={() => setOpen(isOpen ? null : t.attemptId)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-3 px-4 py-4 text-left md:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{t.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {t.kind !== "Mock test" && t.kind !== "Practice" ? `${t.kind} - ` : ""}
                        {when(t.date)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {t.score}/{t.maxScore}
                    </span>
                    <span className={`w-16 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-semibold ${tone(t.percentage || 0)}`}>
                      {round(t.percentage)}%
                    </span>
                    <svg viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {isOpen && <TestDetail test={t} />}
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}