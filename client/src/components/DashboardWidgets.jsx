import { Link } from "react-router-dom";

const MODE_LABELS = {
    practice: "Practice",
    mock: "Mock test",
    wrong_answer_practice: "Wrong answers",
    bookmark_practice: "Bookmarks",
};

// 570 seconds -> "10 min", 4000 -> "1 h 7 min"
const formatTime = (seconds = 0) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
};

// "2026-10-04" -> "Sun"
const weekday = (date) =>
    new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" });

function StatCard({ label, value, hint }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
        </div>
    );
}

// The 4 number cards at the top
export function StatsRow({ totals, streak }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <StatCard label="Questions solved" value={totals.attempted} hint={`${totals.correct} correct`} />
            <StatCard label="Accuracy" value={`${totals.accuracy}%`} hint="Correct out of attempted" />
            <StatCard
                label="Practice streak"
                value={`${streak.current} ${streak.current === 1 ? "day" : "days"}`}
                hint={`Longest: ${streak.longest}`}
            />
            <StatCard label="Tests taken" value={totals.testsTaken} hint={`${formatTime(totals.timeSec)} practised`} />
        </div>
    );
}

// Bar chart of the last 7 days: light = attempted, dark = correct
export function WeeklyChart({ days }) {
    const max = Math.max(1, ...days.map((d) => d.attempted));
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Last 7 days</h2>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-sm bg-indigo-500" /> Correct
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-sm bg-indigo-100" /> Attempted
                    </span>
                </div>
            </div>
            <div className="flex items-end gap-2 h-40 mt-4">
                {days.map((d) => {
                    const barHeight = d.attempted ? (d.attempted / max) * 100 : 0;
                    const correctShare = d.attempted ? (d.correct / d.attempted) * 100 : 0;
                    return (
                        <div key={d.date} className="flex-1 flex flex-col items-center h-full">
                            <div className="w-full flex-1 flex items-end">
                                {d.attempted > 0 ? (
                                    <div
                                        className="w-full rounded-t-md bg-indigo-100 flex flex-col justify-end overflow-hidden"
                                        style={{ height: `${barHeight}%` }}
                                        title={`${d.attempted} attempted, ${d.correct} correct`}
                                    >
                                        <div className="w-full bg-indigo-500" style={{ height: `${correctShare}%` }} />
                                    </div>
                                ) : (
                                    <div className="w-full h-1 rounded bg-slate-100" />
                                )}
                            </div>
                            <span className="text-xs text-slate-500 mt-2">{weekday(d.date)}</span>
                            <span className="text-xs font-medium text-slate-700">{d.attempted}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Weak or strong chapters, each with an accuracy bar
export function ChapterList({ title, chapters, emptyText, tone }) {
    const barColor = tone === "weak" ? "bg-red-500" : "bg-green-500";
    const textColor = tone === "weak" ? "text-red-600" : "text-green-600";
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">{title}</h2>
            {chapters.length === 0 ? (
                <p className="text-sm text-slate-500 mt-3">{emptyText}</p>
            ) : (
                <ul className="mt-4 space-y-4">
                    {chapters.map((c) => (
                        <li key={c.id}>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-slate-800">{c.name}</span>
                                <span className={`font-semibold ${textColor}`}>{c.accuracy}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 mt-1.5 overflow-hidden">
                                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${c.accuracy}%` }} />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {c.correct} of {c.attempted} correct
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

// Recommended chapters + wrong-answer count
export function RecommendedCard({ recommended, wrongCount }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">Recommended</h2>
            {recommended.length === 0 ? (
                <p className="text-sm text-slate-500 mt-3">No weak chapters right now. Keep practising!</p>
            ) : (
                <ul className="mt-3 space-y-2">
                    {recommended.map((r) => (
                        <li key={r.chapterId} className="rounded-lg bg-amber-50 px-3 py-2">
                            <p className="text-sm font-medium text-slate-800">{r.name}</p>
                            <p className="text-xs text-amber-700">{r.reason}</p>
                        </li>
                    ))}
                </ul>
            )}
            <div className="mt-4 rounded-lg bg-slate-50 px-3 py-3">
                <p className="text-2xl font-bold text-slate-900">{wrongCount}</p>
                <p className="text-xs text-slate-500">wrong answers saved for revision</p>
            </div>
        </div>
    );
}

// Table of the latest attempts, each with a Review link
export function RecentTests({ tests }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mt-4">
            <h2 className="font-semibold text-slate-900">Recent tests</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm mt-3">
                    <thead>
                        <tr className="text-left text-slate-500 border-b border-slate-200">
                            <th className="py-2 font-medium">Type</th>
                            <th className="py-2 font-medium">Date</th>
                            <th className="py-2 font-medium text-right">Score</th>
                            <th className="py-2 font-medium text-right">Accuracy</th>
                            <th className="py-2" />
                        </tr>
                    </thead>
                    <tbody>
                        {tests.map((t) => (
                            <tr key={t.attemptId} className="border-b border-slate-100 last:border-0">
                                <td className="py-2.5 text-slate-800">{MODE_LABELS[t.mode] || t.mode}</td>
                                <td className="py-2.5 text-slate-500">
                                    {new Date(t.submittedAt).toLocaleString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </td>
                                <td className="py-2.5 text-right font-medium text-slate-800">
                                    {t.score} / {t.maxScore}
                                </td>
                                <td className="py-2.5 text-right text-slate-600">{t.accuracy}%</td>
                                <td className="py-2.5 text-right">
                                    <Link to={`/result/${t.attemptId}`} className="text-indigo-600 font-medium hover:underline">
                                        Review
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}