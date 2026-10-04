import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// Friendly names for each kind of attempt
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

// One small number card
function StatCard({ label, value, hint }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
        </div>
    );
}

// Bar chart of the last 7 days: light = attempted, dark = correct
function WeeklyChart({ days }) {
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

// A list of chapters with an accuracy bar each
function ChapterList({ title, chapters, emptyText, tone }) {
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

export default function Dashboard() {
    const { user, logout } = useAuth();

    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState(localStorage.getItem("examId") || "");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 1. Load the list of exams once
    useEffect(() => {
        api
            .get("/exams")
            .then((res) => {
                const list = res.data.exams;
                setExams(list);
                // Keep the saved exam if it still exists, otherwise pick the first one
                setExamId((current) =>
                    list.some((e) => e._id === current) ? current : list[0]?._id || ""
                );
            })
            .catch((err) => {
                setError(getErrorMessage(err));
                setLoading(false);
            });
    }, []);

    // 2. Whenever the chosen exam changes, load its dashboard data
    useEffect(() => {
        if (!examId) return;
        localStorage.setItem("examId", examId); // remember the choice
        api
            .get("/progress/dashboard", { params: { examId } })
            .then((res) => {
                setData(res.data);
                setError("");
            })
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, [examId]);

    const chooseExam = (id) => {
        if (id === examId) return;
        setLoading(true);
        setExamId(id);
    };

    const examCode = exams.find((e) => e._id === examId)?.code || "";
    const hasActivity = data && data.totals.attempted > 0;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top bar */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <span className="text-lg font-bold text-slate-900">ExamPrep AI</span>

                    <nav className="flex gap-1 bg-slate-100 rounded-lg p-1">
                        {exams.map((exam) => (
                            <button
                                key={exam._id}
                                onClick={() => chooseExam(exam._id)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium ${exam._id === examId
                                        ? "bg-white text-indigo-700 shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                    }`}
                            >
                                {exam.code}
                            </button>
                        ))}
                    </nav>

                    <button
                        onClick={logout}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5"
                    >
                        Log out
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name}</h1>
                <p className="text-slate-500 mt-1">
                    Your {examCode} preparation at a glance
                </p>

                {error && (
                    <div className="mt-6 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>
                )}

                {loading && !error && (
                    <div className="mt-6 rounded-xl bg-white border border-slate-200 p-6 text-slate-500">
                        Loading your progress...
                    </div>
                )}

                {!loading && data && (
                    <>
                        {/* Stat cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                            <StatCard label="Questions solved" value={data.totals.attempted} hint={`${data.totals.correct} correct`} />
                            <StatCard label="Accuracy" value={`${data.totals.accuracy}%`} hint="Correct out of attempted" />
                            <StatCard
                                label="Practice streak"
                                value={`${data.streak.current} ${data.streak.current === 1 ? "day" : "days"}`}
                                hint={`Longest: ${data.streak.longest}`}
                            />
                            <StatCard
                                label="Tests taken"
                                value={data.totals.testsTaken}
                                hint={`${formatTime(data.totals.timeSec)} practised`}
                            />
                        </div>

                        {!hasActivity ? (
                            <div className="mt-6 rounded-xl bg-white border border-slate-200 p-8 text-center">
                                <p className="font-semibold text-slate-900">No practice yet for {examCode}</p>
                                <p className="text-slate-500 mt-1 text-sm">
                                    Your charts and weak chapters will appear here after your first practice session.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Chart + recommendations */}
                                <div className="grid lg:grid-cols-3 gap-4 mt-4">
                                    <div className="lg:col-span-2">
                                        <WeeklyChart days={data.last7Days} />
                                    </div>

                                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                                        <h2 className="font-semibold text-slate-900">Recommended</h2>
                                        {data.recommended.length === 0 ? (
                                            <p className="text-sm text-slate-500 mt-3">
                                                No weak chapters right now. Keep practising!
                                            </p>
                                        ) : (
                                            <ul className="mt-3 space-y-2">
                                                {data.recommended.map((r) => (
                                                    <li key={r.chapterId} className="rounded-lg bg-amber-50 px-3 py-2">
                                                        <p className="text-sm font-medium text-slate-800">{r.name}</p>
                                                        <p className="text-xs text-amber-700">{r.reason}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <div className="mt-4 rounded-lg bg-slate-50 px-3 py-3">
                                            <p className="text-2xl font-bold text-slate-900">{data.wrongQuestionsCount}</p>
                                            <p className="text-xs text-slate-500">wrong answers saved for revision</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Weak and strong chapters */}
                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                    <ChapterList
                                        title="Weak chapters"
                                        chapters={data.weakChapters}
                                        emptyText="No weak chapters yet."
                                        tone="weak"
                                    />
                                    <ChapterList
                                        title="Strong chapters"
                                        chapters={data.strongChapters}
                                        emptyText="Reach 80% accuracy in a chapter to see it here."
                                        tone="strong"
                                    />
                                </div>

                                {/* Recent tests */}
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
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.recentTests.map((t) => (
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
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}