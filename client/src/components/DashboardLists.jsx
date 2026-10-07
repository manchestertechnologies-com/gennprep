import { Link } from "react-router-dom";

const MODE_LABELS = { practice: "Practice", mock: "Mock test", wrong_answer_practice: "Wrong answers", bookmark_practice: "Bookmarks" };
const card = "bg-white rounded-2xl border border-slate-200 shadow-sm p-5";

// Weak or strong chapters, each with an accuracy bar
export function ChapterList({ title, chapters, emptyText, tone }) {
  const bar = tone === "weak" ? "bg-red-500" : "bg-emerald-500";
  const text = tone === "weak" ? "text-red-600" : "text-emerald-600";
  return (
    <div className={card}>
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {chapters.length === 0 ? (
        <p className="text-sm text-slate-500 mt-3">{emptyText}</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {chapters.map((c) => (
            <li key={c.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800">{c.name}</span>
                <span className={`font-semibold ${text}`}>{c.accuracy}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 mt-1.5 overflow-hidden">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(c.accuracy, 2)}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">{c.correct} of {c.attempted} correct</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// What to study next
export function RecommendedCard({ recommended, wrongCount }) {
  return (
    <div className={card + " flex flex-col"}>
      <h2 className="font-semibold text-slate-900">Focus next</h2>
      {recommended.length === 0 ? (
        <p className="text-sm text-slate-500 mt-3">No weak chapters right now. Keep practising!</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {recommended.map((r) => (
            <li key={r.chapterId} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-sm font-semibold text-slate-800">{r.name}</p>
              <p className="text-xs text-amber-700">{r.reason}</p>
            </li>
          ))}
        </ul>
      )}
      <Link to="/revise" className="mt-auto pt-4 block">
        <span className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 hover:bg-slate-100">
          <span>
            <span className="block text-2xl font-bold text-slate-900">{wrongCount}</span>
            <span className="block text-xs text-slate-500">mistakes saved to revise</span>
          </span>
          <span className="text-sm font-semibold text-indigo-600">Revise &rarr;</span>
        </span>
      </Link>
    </div>
  );
}

// Latest attempts, each with a Review link
export function RecentTests({ tests }) {
  return (
    <div className={card + " mt-4"}>
      <h2 className="font-semibold text-slate-900">Recent tests</h2>
      <ul className="mt-3 divide-y divide-slate-100">
        {tests.map((t) => (
          <li key={t.attemptId} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800">{MODE_LABELS[t.mode] || t.mode}</p>
              <p className="text-xs text-slate-400">
                {new Date(t.submittedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <span className="text-sm font-semibold text-slate-800">{t.score}/{t.maxScore}</span>
            <span className={`w-14 text-center rounded-full px-2 py-0.5 text-xs font-semibold ${t.accuracy >= 75 ? "bg-emerald-50 text-emerald-700" : t.accuracy >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
              {t.accuracy}%
            </span>
            <Link to={`/result/${t.attemptId}`} className="text-sm font-semibold text-indigo-600 hover:underline">Review</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}