import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";

// 125 -> "02:05"
const formatClock = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const DIFFICULTY_STYLES = {
    easy: "bg-green-50 text-green-700",
    medium: "bg-amber-50 text-amber-700",
    hard: "bg-red-50 text-red-700",
};

export default function TestScreen() {
    const { id } = useParams(); // the attempt id from the URL
    const navigate = useNavigate();
    const storageKey = `attempt-${id}`;

    const [questions, setQuestions] = useState([]);
    const [markingScheme, setMarkingScheme] = useState(null);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({}); // questionId -> ["B"]
    const [times, setTimes] = useState({}); // questionId -> seconds spent
    const [elapsed, setElapsed] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const startedAt = useRef(Date.now()); // when the current question was opened

    // 1. Load the questions (without answers)
    useEffect(() => {
        api
            .get(`/attempts/${id}`)
            .then((res) => {
                // Already submitted? Show the result instead
                if (res.data.status !== "in_progress") {
                    navigate(`/result/${id}`, { replace: true });
                    return;
                }
                setQuestions(res.data.questions);
                setMarkingScheme(res.data.markingScheme);

                // Restore answers if the page was refreshed
                const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
                if (saved) {
                    setAnswers(saved.answers || {});
                    setTimes(saved.times || {});
                }
                startedAt.current = Date.now();
            })
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, [id, navigate, storageKey]);

    // 2. A clock that counts up every second
    useEffect(() => {
        const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // 3. Save answers in the browser so a refresh doesn't lose them
    useEffect(() => {
        if (questions.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify({ answers, times }));
        }
    }, [answers, times, questions.length, storageKey]);

    // Adds the time spent on the current question; returns the updated totals
    const recordTime = () => {
        const q = questions[current];
        const spent = Math.round((Date.now() - startedAt.current) / 1000);
        startedAt.current = Date.now();
        if (!q) return times;
        const updated = { ...times, [q._id]: (times[q._id] || 0) + spent };
        setTimes(updated);
        return updated;
    };

    const goTo = (index) => {
        if (index < 0 || index >= questions.length || index === current) return;
        recordTime();
        setCurrent(index);
    };

    const chooseOption = (question, optionId) => {
        setAnswers((prev) => {
            const selected = prev[question._id] || [];
            let next;
            if (question.type === "mcq_multi") {
                // Multiple correct: click to add or remove
                next = selected.includes(optionId)
                    ? selected.filter((x) => x !== optionId)
                    : [...selected, optionId];
            } else {
                // Single correct: click again to unselect
                next = selected[0] === optionId ? [] : [optionId];
            }
            return { ...prev, [question._id]: next };
        });
    };

    const clearAnswer = (question) => setAnswers((prev) => ({ ...prev, [question._id]: [] }));

    const submit = async () => {
        const unanswered = questions.filter((q) => !(answers[q._id] || []).length).length;
        const message =
            unanswered > 0
                ? `You have ${unanswered} unanswered question(s). Submit anyway?`
                : "Submit your answers?";
        if (!window.confirm(message)) return;

        const finalTimes = recordTime();
        setSubmitting(true);
        setError("");
        try {
            await api.post(`/attempts/${id}/submit`, {
                answers: questions.map((q) => ({
                    questionId: q._id,
                    selectedOptionIds: answers[q._id] || [],
                    timeSpentSec: finalTimes[q._id] || 0,
                })),
            });
            localStorage.removeItem(storageKey);
            navigate(`/result/${id}`, { replace: true });
        } catch (err) {
            setError(getErrorMessage(err));
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500">
                Loading questions...
            </div>
        );
    }

    const question = questions[current];

    if (!question) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-center max-w-md">
                    <p className="text-slate-700">{error || "No questions found for this attempt."}</p>
                    <Link to="/dashboard" className="inline-block mt-4 text-indigo-600 font-medium hover:underline">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const selected = answers[question._id] || [];
    const answeredCount = questions.filter((q) => (answers[q._id] || []).length > 0).length;
    const isLast = current === questions.length - 1;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top bar: title, clock, submit */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <span className="font-semibold text-slate-900">Practice</span>
                    <span className="font-mono text-lg text-slate-700" title="Time elapsed">
                        {formatClock(elapsed)}
                    </span>
                    <button
                        onClick={submit}
                        disabled={submitting}
                        className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {submitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-4 gap-6">
                {/* Question */}
                <section className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6">
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-slate-900">
                            Question {current + 1} of {questions.length}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${DIFFICULTY_STYLES[question.difficulty] || ""}`}>
                            {question.difficulty}
                        </span>
                        {markingScheme && (
                            <span className="text-xs text-slate-500">
                                +{markingScheme.correct} correct, {markingScheme.incorrect} wrong
                            </span>
                        )}
                    </div>

                    {question.type === "mcq_multi" && (
                        <p className="text-xs text-indigo-700 mt-2">More than one answer can be correct.</p>
                    )}

                    <p className="text-lg text-slate-900 mt-4 whitespace-pre-line">{question.text}</p>

                    {question.images?.map((img) => (
                        <img key={img.url} src={img.url} alt={img.alt || "Question diagram"} className="mt-4 max-h-72 rounded-lg border border-slate-200" />
                    ))}

                    {/* Options */}
                    <div className="mt-6 space-y-3">
                        {question.options.map((opt) => {
                            const isSelected = selected.includes(opt.id);
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => chooseOption(question, opt.id)}
                                    className={`w-full text-left flex items-start gap-3 rounded-xl border px-4 py-3 ${isSelected
                                        ? "border-indigo-600 bg-indigo-50"
                                        : "border-slate-200 hover:border-slate-400"
                                        }`}
                                >
                                    <span
                                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                                            }`}
                                    >
                                        {opt.id}
                                    </span>
                                    <span className="text-slate-800 pt-0.5">
                                        {opt.text}
                                        {opt.image?.url && (
                                            <img src={opt.image.url} alt={`Option ${opt.id}`} className="mt-2 max-h-40 rounded" />
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Navigation */}
                    <div className="mt-6 flex items-center justify-between gap-2">
                        <button
                            onClick={() => goTo(current - 1)}
                            disabled={current === 0}
                            className="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2 disabled:opacity-40"
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => clearAnswer(question)}
                            disabled={selected.length === 0}
                            className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-40"
                        >
                            Clear answer
                        </button>
                        {isLast ? (
                            <button
                                onClick={submit}
                                disabled={submitting}
                                className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
                            >
                                Submit
                            </button>
                        ) : (
                            <button
                                onClick={() => goTo(current + 1)}
                                className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700"
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </section>

                {/* Question palette */}
                <aside className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
                    <h2 className="font-semibold text-slate-900">Questions</h2>
                    <p className="text-xs text-slate-500 mt-1">
                        {answeredCount} answered · {questions.length - answeredCount} left
                    </p>

                    <div className="grid grid-cols-5 gap-2 mt-4">
                        {questions.map((q, index) => {
                            const answered = (answers[q._id] || []).length > 0;
                            return (
                                <button
                                    key={q._id}
                                    onClick={() => goTo(index)}
                                    className={`h-9 rounded-lg text-sm font-medium ${answered ? "bg-green-500 text-white" : "bg-slate-100 text-slate-700"
                                        } ${index === current ? "ring-2 ring-indigo-500 ring-offset-1" : ""}`}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-4 space-y-1 text-xs text-slate-500">
                        <p className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-green-500" /> Answered
                        </p>
                        <p className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" /> Not answered
                        </p>
                    </div>
                </aside>
            </main>
        </div>
    );
}