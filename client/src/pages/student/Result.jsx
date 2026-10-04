import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import RankCard from "../../components/RankCard";

// 200 -> "3 min 20s"
const formatTime = (seconds = 0) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m ? `${m} min ${s}s` : `${s}s`;
};

const FILTERS = [
    { key: "all", label: "All" },
    { key: "correct", label: "Correct" },
    { key: "wrong", label: "Wrong" },
    { key: "unanswered", label: "Unanswered" },
];

// isCorrect is true, false, or null (not answered)
const verdictOf = (item) =>
    item.isCorrect === null || item.isCorrect === undefined
        ? "unanswered"
        : item.isCorrect
            ? "correct"
            : "wrong";

const VERDICT_STYLES = {
    correct: { label: "Correct", badge: "bg-green-50 text-green-700" },
    wrong: { label: "Wrong", badge: "bg-red-50 text-red-700" },
    unanswered: { label: "Not answered", badge: "bg-slate-100 text-slate-600" },
};

function SummaryTile({ label, value, tone }) {
    return (
        <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-xl font-bold ${tone || "text-slate-900"}`}>{value}</p>
        </div>
    );
}

export default function Result() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [bookmarked, setBookmarked] = useState({}); // questionId -> true

    // Load the result and review
    useEffect(() => {
        api
            .get(`/attempts/${id}`)
            .then((res) => {
                // Not submitted yet? Go back to the test
                if (res.data.status === "in_progress") {
                    navigate(`/attempt/${id}`, { replace: true });
                    return;
                }
                setData(res.data);
            })
            .catch((err) => setError(getErrorMessage(err)));
    }, [id, navigate]);

    // Find out which questions are already bookmarked
    useEffect(() => {
        api
            .get("/bookmarks")
            .then((res) => {
                const map = {};
                res.data.bookmarks.forEach((b) => {
                    map[b.question._id] = true;
                });
                setBookmarked(map);
            })
            .catch(() => { });
    }, []);

    const toggleBookmark = async (questionId) => {
        const isOn = Boolean(bookmarked[questionId]);
        setBookmarked((prev) => ({ ...prev, [questionId]: !isOn })); // update the screen straight away
        try {
            if (isOn) await api.delete(`/bookmarks/${questionId}`);
            else await api.post("/bookmarks", { questionId });
        } catch {
            setBookmarked((prev) => ({ ...prev, [questionId]: isOn })); // undo if it failed
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-center max-w-md">
                    <p className="text-red-700">{error}</p>
                    <Link to="/dashboard" className="inline-block mt-4 text-indigo-600 font-medium hover:underline">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500">
                Loading your result...
            </div>
        );
    }

    const { result, review } = data;
    const countFor = (key) =>
        key === "all" ? review.length : review.filter((item) => verdictOf(item) === key).length;
    const visible = review.filter((item) => filter === "all" || verdictOf(item) === filter);

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">ExamPrep AI</span>
                    <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                        ← Back to dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
        <RankCard data={data} />
                {/* Score summary */}
                <section className="bg-white rounded-xl border border-slate-200 p-6">
                    <p className="text-sm text-slate-500">Your score</p>
                    <p className="text-4xl font-bold text-slate-900 mt-1">
                        {result.score} <span className="text-2xl text-slate-400">/ {result.maxScore}</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{result.percentage}% of the maximum marks</p>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
                        <SummaryTile label="Accuracy" value={`${result.accuracy}%`} />
                        <SummaryTile label="Correct" value={result.correct} tone="text-green-600" />
                        <SummaryTile label="Wrong" value={result.incorrect} tone="text-red-600" />
                        <SummaryTile label="Unanswered" value={result.unanswered} />
                        <SummaryTile label="Time" value={formatTime(result.timeTakenSec)} />
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                        <Link
                            to="/practice"
                            className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 hover:bg-indigo-700"
                        >
                            Practise again
                        </Link>
                        <Link
                            to="/dashboard"
                            className="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 hover:border-slate-400"
                        >
                            Back to dashboard
                        </Link>
                    </div>
                </section>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2 mt-8">
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === f.key
                                    ? "bg-slate-900 text-white"
                                    : "bg-white border border-slate-300 text-slate-700 hover:border-slate-400"
                                }`}
                        >
                            {f.label} ({countFor(f.key)})
                        </button>
                    ))}
                </div>

                {/* Review of each question */}
                <div className="mt-4 space-y-4">
                    {visible.length === 0 && (
                        <p className="text-sm text-slate-500">No questions in this group.</p>
                    )}

                    {visible.map((item) => {
                        const verdict = verdictOf(item);
                        const style = VERDICT_STYLES[verdict];
                        const isBookmarked = Boolean(bookmarked[item.questionId]);
                        const correctIds = item.correctOptionIds || [];
                        const chosenIds = item.selectedOptionIds || [];

                        return (
                            <article key={item.questionId} className="bg-white rounded-xl border border-slate-200 p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-slate-900">Q{item.number}</span>
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${style.badge}`}>
                                        {style.label}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        {item.marksAwarded > 0 ? `+${item.marksAwarded}` : item.marksAwarded} marks ·{" "}
                                        {formatTime(item.timeSpentSec)}
                                    </span>
                                    <button
                                        onClick={() => toggleBookmark(item.questionId)}
                                        className={`ml-auto text-sm font-medium ${isBookmarked ? "text-amber-600" : "text-slate-500 hover:text-slate-800"
                                            }`}
                                    >
                                        {isBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
                                    </button>
                                </div>

                                <p className="text-slate-900 mt-3 whitespace-pre-line">{item.text}</p>

                                {item.images?.map((img) => (
                                    <img key={img.url} src={img.url} alt={img.alt || "Question diagram"} className="mt-3 max-h-64 rounded-lg border border-slate-200" />
                                ))}

                                {/* Options: green = correct answer, red = your wrong choice */}
                                <div className="mt-4 space-y-2">
                                    {item.options.map((opt) => {
                                        const isCorrectOption = correctIds.includes(opt.id);
                                        const isChosen = chosenIds.includes(opt.id);
                                        let box = "border-slate-200";
                                        if (isCorrectOption) box = "border-green-500 bg-green-50";
                                        else if (isChosen) box = "border-red-500 bg-red-50";

                                        return (
                                            <div key={opt.id} className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${box}`}>
                                                <span className="font-semibold text-slate-700 w-5">{opt.id}</span>
                                                <span className="text-slate-800 flex-1">{opt.text}</span>
                                                {isCorrectOption && (
                                                    <span className="text-xs font-medium text-green-700">
                                                        {isChosen ? "Your answer ✓" : "Correct answer"}
                                                    </span>
                                                )}
                                                {isChosen && !isCorrectOption && (
                                                    <span className="text-xs font-medium text-red-700">Your answer</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {item.explanation?.text && (
                                    <div className="mt-4 rounded-lg bg-indigo-50 px-4 py-3">
                                        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Explanation</p>
                                        <p className="text-sm text-slate-800 mt-1 whitespace-pre-line">{item.explanation.text}</p>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}