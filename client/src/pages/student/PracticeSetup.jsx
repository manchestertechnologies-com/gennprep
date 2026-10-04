import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";

const DIFFICULTIES = [
    { value: "any", label: "Any" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
];
const COUNTS = [5, 10, 20, 30];

// Style for the choice buttons: highlighted when selected
const pillClass = (selected) =>
    `px-4 py-2 rounded-lg border text-sm font-medium ${selected
        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
        : "border-slate-300 text-slate-700 hover:border-slate-400"
    }`;

export default function PracticeSetup() {
    const navigate = useNavigate();
    const examId = localStorage.getItem("examId"); // chosen on the dashboard

    const [examCode, setExamCode] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [subjectId, setSubjectId] = useState("");
    const [chapters, setChapters] = useState([]);
    const [chapterId, setChapterId] = useState("");
    const [difficulty, setDifficulty] = useState("any");
    const [count, setCount] = useState(10);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState("");

    // Load the exam name and its subjects
    useEffect(() => {
        if (!examId) return;
        api
            .get("/exams")
            .then((res) => {
                const exam = res.data.exams.find((e) => e._id === examId);
                setExamCode(exam ? exam.code : "");
            })
            .catch(() => { });
        api
            .get(`/exams/${examId}/subjects`)
            .then((res) => setSubjects(res.data.subjects))
            .catch((err) => setError(getErrorMessage(err)));
    }, [examId]);

    // When a subject is clicked, load its chapters
    const chooseSubject = (id) => {
        setSubjectId(id);
        setChapterId("");
        setChapters([]);
        setError("");
        setLoadingChapters(true);
        api
            .get(`/subjects/${id}/chapters`)
            .then((res) => setChapters(res.data.chapters))
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoadingChapters(false));
    };

    // Ask the backend for random questions, then open the test screen
    const startPractice = async () => {
        setError("");
        setStarting(true);
        try {
            const res = await api.post("/attempts/practice", { chapterId, difficulty, count });
            navigate(`/attempt/${res.data.attemptId}`);
        } catch (err) {
            setError(getErrorMessage(err));
            setStarting(false);
        }
    };

    if (!examId) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
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
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">ExamPrep AI</span>
                    <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                        ← Back to dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-slate-900">Practice {examCode}</h1>
                <p className="text-slate-500 mt-1">Pick a chapter and how many questions you want.</p>

                {error && (
                    <div className="mt-5 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>
                )}

                {/* Step 1: subject */}
                <section className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
                    <h2 className="font-semibold text-slate-900">1. Subject</h2>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {subjects.map((s) => (
                            <button key={s._id} onClick={() => chooseSubject(s._id)} className={pillClass(s._id === subjectId)}>
                                {s.name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Step 2: chapter */}
                {subjectId && (
                    <section className="mt-4 bg-white rounded-xl border border-slate-200 p-5">
                        <h2 className="font-semibold text-slate-900">2. Chapter</h2>
                        {loadingChapters ? (
                            <p className="text-sm text-slate-500 mt-3">Loading chapters...</p>
                        ) : chapters.length === 0 ? (
                            <p className="text-sm text-slate-500 mt-3">No chapters added for this subject yet.</p>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-2 mt-3">
                                {chapters.map((c) => (
                                    <button
                                        key={c._id}
                                        onClick={() => setChapterId(c._id)}
                                        className={`text-left ${pillClass(c._id === chapterId)}`}
                                    >
                                        <span className="block">{c.name}</span>
                                        <span className="block text-xs font-normal text-slate-500 mt-0.5">Class {c.classLevel}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Step 3: settings and start */}
                {chapterId && (
                    <>
                        <section className="mt-4 bg-white rounded-xl border border-slate-200 p-5">
                            <h2 className="font-semibold text-slate-900">3. Settings</h2>

                            <p className="text-sm text-slate-500 mt-3">Difficulty</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {DIFFICULTIES.map((d) => (
                                    <button key={d.value} onClick={() => setDifficulty(d.value)} className={pillClass(d.value === difficulty)}>
                                        {d.label}
                                    </button>
                                ))}
                            </div>

                            <p className="text-sm text-slate-500 mt-4">Number of questions</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {COUNTS.map((n) => (
                                    <button key={n} onClick={() => setCount(n)} className={pillClass(n === count)}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-3">
                                If the chapter has fewer questions, you get all of them.
                            </p>
                        </section>

                        <button
                            onClick={startPractice}
                            disabled={starting}
                            className="mt-6 w-full rounded-lg bg-indigo-600 text-white font-medium py-3 hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {starting ? "Preparing questions..." : "Start practice"}
                        </button>
                    </>
                )}
            </main>
        </div>
    );
}