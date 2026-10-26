import EmptyState from "../../components/EmptyState";
import MathText from "../../components/MathText";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import { ChapterList, RecentTests } from "../../components/DashboardLists";

const COUNTS = [10, 20, 30];

const pillClass = (selected) =>
    `px-4 py-2 rounded-lg border text-sm font-medium ${selected
        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
        : "border-slate-300 text-slate-700 hover:border-slate-400"
    }`;

export default function Revise() {
    const navigate = useNavigate();
    const examId = localStorage.getItem("examId");

    const [wrongCount, setWrongCount] = useState(0);
    const [showBookmarks, setShowBookmarks] = useState(false); // the list opens only when asked
    const [progress, setProgress] = useState(null); // weak / strong chapters and recent tests
    const [bookmarks, setBookmarks] = useState([]);
    const [count, setCount] = useState(20);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(""); // "wrong", "bookmarks" or ""
    const [error, setError] = useState("");

    // Load the wrong-answer count and the bookmark list together
    useEffect(() => {
        if (!examId) return;
        Promise.all([
            api.get("/progress/dashboard", { params: { examId } }),
            api.get("/bookmarks", { params: { examId } }),
        ])
            .then(([dash, marks]) => {
                setWrongCount(dash.data.wrongQuestionsCount);
                setProgress(dash.data);
                setBookmarks(marks.data.bookmarks);
            })
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, [examId]);

    // Start a practice made of wrong answers or bookmarks, then open the test screen
    const start = async (kind) => {
        setError("");
        setStarting(kind);
        const url = kind === "wrong" ? "/attempts/wrong-answers" : "/attempts/bookmarks";
        try {
            const res = await api.post(url, { examId, count });
            navigate(`/attempt/${res.data.attemptId}`);
        } catch (err) {
            setError(getErrorMessage(err));
            setStarting("");
        }
    };

    const removeBookmark = async (questionId) => {
        const before = bookmarks;
        setBookmarks((list) => list.filter((b) => b.question._id !== questionId)); // update the screen first
        try {
            await api.delete(`/bookmarks/${questionId}`);
        } catch (err) {
            setBookmarks(before); // put it back if the server refused
            setError(getErrorMessage(err));
        }
    };

    if (!examId) {
        return (
            <div className="bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                    <p className="text-slate-700">Choose an exam on your dashboard first.</p>
                    <Link to="/dashboard" className="inline-block mt-4 text-indigo-600 font-medium hover:underline">
                        Go to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50">

            <main className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-slate-900">Revise</h1>
                <p className="text-slate-500 mt-1">Turn your mistakes and saved questions into practice.</p>

                {error && <div className="mt-5 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

                {loading ? (
                    <p className="mt-6 text-slate-500">Loading...</p>
                ) : (
                    <>
                        <p className="text-sm text-slate-500 mt-6">Questions per session</p>
                        <div className="flex gap-2 mt-2">
                            {COUNTS.map((n) => (
                                <button key={n} onClick={() => setCount(n)} className={pillClass(n === count)}>
                                    {n}
                                </button>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-4">
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <p className="text-3xl font-bold text-slate-900">{wrongCount}</p>
                                <p className="text-sm text-slate-500">wrong answers to revise</p>
                                <p className="text-xs text-slate-400 mt-1">A question leaves this list once you answer it correctly.</p>
                                <button
                                    onClick={() => start("wrong")}
                                    disabled={wrongCount === 0 || starting !== ""}
                                    className="mt-4 w-full rounded-lg bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {starting === "wrong" ? "Preparing..." : "Practise wrong answers"}
                                </button>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <p className="text-3xl font-bold text-slate-900">{bookmarks.length}</p>
                                <p className="text-sm text-slate-500">bookmarked questions</p>
                                <p className="text-xs text-slate-400 mt-1">Bookmark questions from any result page.</p>
                                <button
                                    onClick={() => start("bookmarks")}
                                    disabled={bookmarks.length === 0 || starting !== ""}
                                    className="mt-4 w-full rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 hover:bg-slate-700 disabled:opacity-50"
                                >
                                    {starting === "bookmarks" ? "Preparing..." : "Practise bookmarks"}
                                </button>
                                <button
                                    onClick={() => setShowBookmarks((s) => !s)}
                                    disabled={bookmarks.length === 0}
                                    className="mt-2 w-full rounded-lg border border-slate-300 text-slate-700 text-sm font-medium py-2.5 hover:bg-slate-100 disabled:opacity-50"
                                >
                                    {showBookmarks ? "Hide bookmarked questions" : "View bookmarked questions"}
                                </button>
                            </div>
                        </div>

                        {progress && (
                            <>
                                <div className="grid md:grid-cols-2 gap-4 mt-6">
                                    <ChapterList title="Weak chapters" chapters={progress.weakChapters || []} emptyText="No weak chapters yet." tone="weak" />
                                    <ChapterList title="Strong chapters" chapters={progress.strongChapters || []} emptyText="Reach 80% accuracy in a chapter to see it here." tone="strong" />
                                </div>
                                {(progress.recentTests || []).length > 0 && <RecentTests tests={progress.recentTests} />}
                            </>
                        )}

                        {showBookmarks && (
                        <div>
                        <h2 className="font-semibold text-slate-900 mt-8">Your bookmarks</h2>
                        {bookmarks.length === 0 ? (
                            <EmptyState icon="star" title="No bookmarks yet" text="Tap the star on any question in your results to save it here for revision." actionLabel="Go to my dashboard" actionTo="/dashboard" />
                        ) : (
                            <div className="mt-3 space-y-3">
                                {bookmarks.map((b) => (
                                    <article key={b.bookmarkId} className="bg-white rounded-xl border border-slate-200 p-5">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="capitalize">{b.question.difficulty}</span>
                                            <span>·</span>
                                            <span>Saved {new Date(b.savedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                            <button
                                                onClick={() => removeBookmark(b.question._id)}
                                                className="ml-auto text-sm font-medium text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <MathText as="p" className="text-slate-900 mt-2 whitespace-pre-line" text={b.question.text} />
                                        <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                                            {b.question.options.map((opt) => (
                                                <li key={opt.id} className="text-sm text-slate-700 rounded-lg border border-slate-200 px-3 py-2">
                                                    <span className="font-semibold mr-2">{opt.id}</span>
                                                    <MathText text={opt.text} />
                                                </li>
                                            ))}
                                        </ul>
                                        {b.note && <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3">Note: {b.note}</p>}
                                    </article>
                                ))}
                            </div>
                        )}
                        </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}