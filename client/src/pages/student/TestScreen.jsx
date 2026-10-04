import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import QuestionView from "../../components/QuestionView";
import QuestionPalette from "../../components/QuestionPalette";

const pad = (n) => String(n).padStart(2, "0");
const formatClock = (seconds) => {
    const s = Math.max(0, seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
};

// Answers in the shape the server expects
const buildPayload = (questions, answers, marked, times) =>
    questions.map((q) => ({
        questionId: q._id,
        selectedOptionIds: answers[q._id] || [],
        markedForReview: Boolean(marked[q._id]),
        timeSpentSec: times[q._id] || 0,
    }));

const SAVE_TEXT = { saving: "Saving...", saved: "All answers saved", error: "Not saved yet, retrying" };

export default function TestScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const storageKey = `attempt-${id}`;

    const [info, setInfo] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({});
    const [marked, setMarked] = useState({});
    const [times, setTimes] = useState({});
    const [openedAt] = useState(() => Date.now());
    const [now, setNow] = useState(() => Date.now());
    const [clockOffset, setClockOffset] = useState(0); // server clock minus computer clock
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [saveState, setSaveState] = useState("");
    const [error, setError] = useState("");

    const startedAt = useRef(Date.now()); // when the current question was opened
    const dirty = useRef(false); // something changed since the last autosave
    const submitted = useRef(false);
    const latest = useRef({ questions: [], answers: {}, marked: {}, times: {} });

    // 1. Load the attempt and restore saved answers (server first, then this browser's copy)
    useEffect(() => {
        api
            .get(`/attempts/${id}`)
            .then((res) => {
                const d = res.data;
                if (d.status !== "in_progress") {
                    navigate(`/result/${id}`, { replace: true });
                    return;
                }
                setInfo({ mode: d.mode, title: d.testTitle || "Practice", markingScheme: d.markingScheme, expiresAt: d.expiresAt });
                setQuestions(d.questions);
                if (d.expiresAt) setClockOffset(new Date(d.serverNow).getTime() - Date.now());

                const a = {};
                const m = {};
                const t = {};
                (d.savedAnswers || []).forEach((s) => {
                    if (s.selectedOptionIds?.length) a[s.questionId] = s.selectedOptionIds;
                    if (s.markedForReview) m[s.questionId] = true;
                    if (s.timeSpentSec) t[s.questionId] = s.timeSpentSec;
                });
                const local = JSON.parse(localStorage.getItem(storageKey) || "null");
                setAnswers({ ...a, ...local?.answers });
                setMarked({ ...m, ...local?.marked });
                setTimes({ ...t, ...local?.times });
                startedAt.current = Date.now();
            })
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, [id, navigate, storageKey]);

    // 2. Tick every second (drives the clock)
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 3. Keep a copy in this browser and note that something changed
    useEffect(() => {
        latest.current = { questions, answers, marked, times };
        if (questions.length === 0) return;
        localStorage.setItem(storageKey, JSON.stringify({ answers, marked, times }));
        dirty.current = true;
    }, [questions, answers, marked, times, storageKey]);

    // 4. Mock tests: autosave to the server every 10 seconds if something changed
    const isMock = info?.mode === "mock";
    useEffect(() => {
        if (!isMock) return;
        const timer = setInterval(() => {
            if (!dirty.current || submitted.current) return;
            dirty.current = false;
            const l = latest.current;
            setSaveState("saving");
            api
                .put(`/attempts/${id}/answers`, { answers: buildPayload(l.questions, l.answers, l.marked, l.times) })
                .then(() => setSaveState("saved"))
                .catch((err) => {
                    if (err.response?.status === 409) navigate(`/result/${id}`, { replace: true }); // time already up
                    else {
                        dirty.current = true;
                        setSaveState("error");
                    }
                });
        }, 10000);
        return () => clearInterval(timer);
    }, [isMock, id, navigate]);

    // Adds time spent on the current question; returns the updated totals
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
            const next =
                question.type === "mcq_multi"
                    ? selected.includes(optionId)
                        ? selected.filter((x) => x !== optionId)
                        : [...selected, optionId]
                    : selected[0] === optionId
                        ? []
                        : [optionId];
            return { ...prev, [question._id]: next };
        });
    };

    const submit = async (auto = false) => {
        if (submitted.current) return;
        if (!auto) {
            const unanswered = questions.filter((q) => !(answers[q._id] || []).length).length;
            const markedCount = questions.filter((q) => marked[q._id]).length;
            const parts = [];
            if (unanswered) parts.push(`${unanswered} unanswered`);
            if (markedCount) parts.push(`${markedCount} marked for review`);
            const message = parts.length ? `You have ${parts.join(" and ")}. Submit anyway?` : "Submit your answers?";
            if (!window.confirm(message)) return;
        }
        submitted.current = true;
        const finalTimes = recordTime();
        setSubmitting(true);
        setError("");
        try {
            await api.post(`/attempts/${id}/submit`, { answers: buildPayload(questions, answers, marked, finalTimes) });
            localStorage.removeItem(storageKey);
            navigate(`/result/${id}`, { replace: true });
        } catch (err) {
            if (err.response?.status === 400) {
                // already submitted (for example, automatically by the server)
                localStorage.removeItem(storageKey);
                navigate(`/result/${id}`, { replace: true });
                return;
            }
            submitted.current = false;
            setSubmitting(false);
            setError(getErrorMessage(err));
        }
    };

    const remaining = info?.expiresAt
        ? Math.floor((new Date(info.expiresAt).getTime() - (now + clockOffset)) / 1000)
        : null;

    // 5. Time is up: submit automatically
    useEffect(() => {
        if (remaining !== null && remaining <= 0 && !submitted.current) submit(true);
    });

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading questions...</div>;
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

    const clockText = formatClock(remaining !== null ? remaining : Math.floor((now - openedAt) / 1000));
    let clockColor = "text-slate-700";
    if (remaining !== null && remaining <= 60) clockColor = "text-red-600 animate-pulse";
    else if (remaining !== null && remaining <= 300) clockColor = "text-amber-600";

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-slate-900">{info.title}</p>
                        {isMock && <p className="text-xs text-slate-500">{SAVE_TEXT[saveState] || "Answers save automatically"}</p>}
                    </div>
                    <div className="text-center">
                        <p className={`font-mono text-xl font-semibold ${clockColor}`}>{clockText}</p>
                        <p className="text-xs text-slate-500">{isMock ? "time left" : "time spent"}</p>
                    </div>
                    <button
                        onClick={() => submit(false)}
                        disabled={submitting}
                        className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {submitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}
                    <QuestionView
                        question={question}
                        index={current}
                        total={questions.length}
                        selected={answers[question._id] || []}
                        isMarked={Boolean(marked[question._id])}
                        markingScheme={info.markingScheme}
                        isMock={isMock}
                        submitting={submitting}
                        onChoose={(optionId) => chooseOption(question, optionId)}
                        onClear={() => setAnswers((prev) => ({ ...prev, [question._id]: [] }))}
                        onToggleMark={() => setMarked((prev) => ({ ...prev, [question._id]: !prev[question._id] }))}
                        onPrev={() => goTo(current - 1)}
                        onNext={() => goTo(current + 1)}
                        onSubmit={() => submit(false)}
                    />
                </div>
                <QuestionPalette
                    questions={questions}
                    current={current}
                    answers={answers}
                    marked={marked}
                    showMarked={isMock}
                    onJump={goTo}
                />
            </main>
        </div>
    );
}