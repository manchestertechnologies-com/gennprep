import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";

const TYPE_LABELS = {
    chapter: "Chapter test",
    subject: "Subject test",
    full_syllabus: "Full syllabus",
    pyq: "Previous year",
    custom: "Custom",
};

export default function MockTests() {
    const navigate = useNavigate();
    const examId = localStorage.getItem("examId");

    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [chosen, setChosen] = useState(null); // the test whose instructions are open
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        if (!examId) return;
        api
            .get("/tests", { params: { examId } })
            .then((res) => setTests(res.data.tests))
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, [examId]);

    const begin = async (test) => {
        setStarting(true);
        setError("");
        try {
            const res = await api.post(`/tests/${test._id}/start`);
            navigate(`/attempt/${res.data.attemptId}`);
        } catch (err) {
            setError(getErrorMessage(err));
            setStarting(false);
            setChosen(null);
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
                <h1 className="text-2xl font-bold text-slate-900">Mock tests</h1>
                <p className="text-slate-500 mt-1">Timed tests with negative marking, just like the real exam.</p>

                {error && <div className="mt-5 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

                {loading && <p className="mt-6 text-slate-500">Loading tests...</p>}

                {!loading && tests.length === 0 && (
                    <div className="mt-6 rounded-xl bg-white border border-slate-200 p-8 text-center text-slate-500">
                        No mock tests have been published for this exam yet.
                    </div>
                )}

                <div className="mt-6 space-y-4">
                    {tests.map((t) => {
                        const noAttemptsLeft = t.maxAttempts > 0 && t.attemptsUsed >= t.maxAttempts;
                        return (
                            <article key={t._id} className="bg-white rounded-xl border border-slate-200 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-indigo-700">{TYPE_LABELS[t.type] || t.type}</p>
                                        <h2 className="text-lg font-semibold text-slate-900">{t.title}</h2>
                                        <p className="text-sm text-slate-500">{t.sections.join(" · ")}</p>
                                    </div>

                                    {t.inProgressAttemptId ? (
                                        <Link
                                            to={`/attempt/${t.inProgressAttemptId}`}
                                            className="rounded-lg bg-purple-600 text-white text-sm font-medium px-4 py-2 hover:bg-purple-700"
                                        >
                                            Resume
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => setChosen(t)}
                                            disabled={noAttemptsLeft || !t.isOpen}
                                            className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:bg-indigo-700 disabled:bg-slate-300"
                                        >
                                            {noAttemptsLeft ? "No attempts left" : !t.isOpen ? "Not open now" : "Start test"}
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-sm text-slate-600">
                                    <span>{t.durationMinutes} min</span>
                                    <span>{t.totalQuestions} questions</span>
                                    <span>{t.totalMarks} marks</span>
                                    <span>
                                        +{t.markingScheme.correct} / {t.markingScheme.incorrect}
                                    </span>
                                    <span>
                                        Attempts: {t.attemptsUsed}
                                        {t.maxAttempts > 0 ? ` of ${t.maxAttempts}` : ""}
                                    </span>
                                    {t.bestScore !== null && <span className="font-medium text-slate-800">Best: {t.bestScore}</span>}
                                </div>

                                {t.lastAttemptId && (
                                    <Link to={`/result/${t.lastAttemptId}`} className="inline-block mt-3 text-sm font-medium text-indigo-600 hover:underline">
                                        View last result
                                    </Link>
                                )}
                            </article>
                        );
                    })}
                </div>
            </main>

            {/* Instructions shown before starting */}
            {chosen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-20">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                        <h2 className="text-xl font-bold text-slate-900">{chosen.title}</h2>
                        <ul className="mt-4 space-y-2 text-sm text-slate-700 list-disc pl-5">
                            <li>
                                {chosen.totalQuestions} questions in {chosen.durationMinutes} minutes.
                            </li>
                            <li>
                                +{chosen.markingScheme.correct} for a correct answer, {chosen.markingScheme.incorrect} for a wrong one, 0 if
                                left blank.
                            </li>
                            <li>The timer keeps running even if you close the page.</li>
                            <li>When time runs out, your saved answers are submitted automatically.</li>
                            <li>Use "Mark for review" to come back to a question later.</li>
                        </ul>
                        {chosen.instructions && (
                            <p className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">{chosen.instructions}</p>
                        )}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setChosen(null)}
                                disabled={starting}
                                className="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => begin(chosen)}
                                disabled={starting}
                                className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {starting ? "Starting..." : "I'm ready, start"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}