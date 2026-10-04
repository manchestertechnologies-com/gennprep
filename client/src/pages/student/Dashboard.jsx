import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
    ChapterList,
    RecentTests,
    RecommendedCard,
    StatsRow,
    WeeklyChart,
} from "../../components/DashboardWidgets";

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
        localStorage.setItem("examId", examId);
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
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <span className="text-lg font-bold text-slate-900">ExamPrep AI</span>
                    <nav className="flex gap-1 bg-slate-100 rounded-lg p-1">
                        {exams.map((exam) => (
                            <button
                                key={exam._id}
                                onClick={() => chooseExam(exam._id)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium ${exam._id === examId ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
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
                <p className="text-slate-500 mt-1">Your {examCode} preparation at a glance</p>

                <div className="flex flex-wrap gap-3 mt-4">
                    <Link
                        to="/practice"
                        className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 hover:bg-indigo-700"
                    >
                        Start practice
                    </Link>
                    <Link
                        to="/revise"
                        className="rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium px-4 py-2.5 hover:border-slate-400"
                    >
                        Revise mistakes and bookmarks
                    </Link>
                </div>

                {error && <div className="mt-6 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

                {loading && !error && (
                    <div className="mt-6 rounded-xl bg-white border border-slate-200 p-6 text-slate-500">
                        Loading your progress...
                    </div>
                )}

                {!loading && data && <StatsRow totals={data.totals} streak={data.streak} />}

                {!loading && data && !hasActivity && (
                    <div className="mt-6 rounded-xl bg-white border border-slate-200 p-8 text-center">
                        <p className="font-semibold text-slate-900">No practice yet for {examCode}</p>
                        <p className="text-slate-500 mt-1 text-sm">
                            Your charts and weak chapters will appear here after your first practice session.
                        </p>
                    </div>
                )}

                {!loading && hasActivity && (
                    <div>
                        <div className="grid lg:grid-cols-3 gap-4 mt-4">
                            <div className="lg:col-span-2">
                                <WeeklyChart days={data.last7Days} />
                            </div>
                            <RecommendedCard recommended={data.recommended} wrongCount={data.wrongQuestionsCount} />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <ChapterList title="Weak chapters" chapters={data.weakChapters} emptyText="No weak chapters yet." tone="weak" />
                            <ChapterList
                                title="Strong chapters"
                                chapters={data.strongChapters}
                                emptyText="Reach 80% accuracy in a chapter to see it here."
                                tone="strong"
                            />
                        </div>

                        <RecentTests tests={data.recentTests} />
                    </div>
                )}
            </main>
        </div>
    );
}