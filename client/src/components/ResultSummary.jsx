import { Link } from "react-router-dom";
import { formatTime } from "./resultHelpers";

const message = (pct) =>
  pct >= 80 ? "Excellent work!" : pct >= 60 ? "Good job!" : pct >= 40 ? "Nice effort, keep going." : "Keep practising, you'll get there.";

// Circle that fills up to the percentage
function ScoreRing({ pct }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const filled = (Math.min(Math.max(pct, 0), 100) / 100) * c;
  const color = pct >= 60 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${filled} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-900">{Math.round(pct)}%</span>
        <span className="text-xs text-slate-500">score</span>
      </div>
    </div>
  );
}

function Tile({ label, value, sub, tone = "text-slate-900", className = "" }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white px-4 py-3 ${className}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-0.5 text-2xl font-bold ${tone}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default function ResultSummary({ data, onShowWrong }) {
  const { result } = data;
  const isMock = data.mode === "mock";
  const total = result.correct + result.incorrect + result.unanswered || 1;
  const rank = data.rank;
  const bar = [
    { key: "Correct", n: result.correct, cls: "bg-emerald-500" },
    { key: "Wrong", n: result.incorrect, cls: "bg-red-500" },
    { key: "Skipped", n: result.unanswered, cls: "bg-slate-300" },
  ];

  return (
    <>
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
        <ScoreRing pct={result.percentage} />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-medium text-indigo-600">{isMock ? data.testTitle || "Mock test" : "Practice result"}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{message(result.percentage)}</h1>
          <p className="mt-1 text-slate-600">
            You scored <b className="text-slate-900">{result.score}</b> out of {result.maxScore} marks.
          </p>
          {data.status === "auto_submitted" && (
            <p className="mt-2 text-xs text-amber-700">Time ran out, so your saved answers were submitted automatically.</p>
          )}
        </div>
        {isMock && rank && (
          <div className="flex sm:flex-col gap-6 sm:gap-3 rounded-xl bg-indigo-50 px-5 py-4 text-center">
            <div>
              <p className="text-xs text-indigo-700">Rank</p>
              <p className="text-2xl font-bold text-slate-900">
                {rank.rank}
                <span className="text-sm font-normal text-slate-500"> / {rank.totalCandidates}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-indigo-700">Percentile</p>
              <p className="text-2xl font-bold text-slate-900">{rank.percentile}</p>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
        <Tile label="Correct" value={result.correct} tone="text-emerald-600" />
        <Tile label="Wrong" value={result.incorrect} tone="text-red-600" />
        <Tile label="Skipped" value={result.unanswered} tone="text-slate-500" />
        <Tile label="Accuracy" value={`${result.accuracy}%`} sub="of attempted" />
        <Tile className="col-span-2 sm:col-span-1" label="Time" value={formatTime(result.timeTakenSec)} sub={`${formatTime((result.timeTakenSec || 0) / total)} per question`} />
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 gap-0.5">
          {bar.map((b) => b.n > 0 && <div key={b.key} className={b.cls} style={{ width: `${(b.n / total) * 100}%` }} title={`${b.key}: ${b.n}`} />)}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
          {bar.map((b) => (
            <span key={b.key} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${b.cls}`} /> {b.key} {b.n}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {result.incorrect > 0 && (
            <button onClick={onShowWrong} className="rounded-lg bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 hover:bg-indigo-700">
              Review wrong answers
            </button>
          )}
          <Link to="/revise" className="rounded-lg border border-indigo-200 text-indigo-700 text-sm font-medium px-4 py-2.5 hover:bg-indigo-50">
            Practise my mistakes
          </Link>
          <Link to={isMock ? "/mock-tests" : "/practice"} className="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 hover:bg-slate-50">
            {isMock ? "More mock tests" : "Practise again"}
          </Link>
          <Link to="/dashboard" className="rounded-lg text-slate-500 text-sm font-medium px-2 py-2.5 hover:text-slate-800">
            Back to dashboard
          </Link>
        </div>
        {isMock && <p className="mt-3 text-xs text-slate-400">Your rank updates as more students take this test.</p>}
      </div>
    </>
  );
}