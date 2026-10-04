import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";
import SyllabusPicker from "../../components/SyllabusPicker";
import SectionRows from "../../components/SectionRows";

const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const TYPES = { chapter: "Chapter test", subject: "Subject test", full_syllabus: "Full syllabus", pyq: "Previous year", custom: "Custom" };
const EMPTY = { title: "", type: "subject", durationMinutes: 60, maxAttempts: 0, instructions: "" };
const blankSection = () => ({ subjectId: "", chapterId: "", count: 10 });

export default function ManageTests() {
    const [examId, setExamId] = useState(localStorage.getItem("examId") || "");
    const [tests, setTests] = useState([]);
    const [reload, setReload] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [sections, setSections] = useState([blankSection()]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (!examId) return;
        api
            .get("/admin/tests", { params: { examId } })
            .then((res) => setTests(res.data.tests))
            .catch((err) => setMessage({ type: "error", text: getErrorMessage(err) }));
    }, [examId, reload]);

    const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const create = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        setSaving(true);
        try {
            const res = await api.post("/admin/tests", {
                ...form,
                examId,
                sections: sections.map((s) => ({
                    subjectId: s.subjectId,
                    count: Number(s.count),
                    ...(s.chapterId ? { chapterIds: [s.chapterId] } : {}),
                })),
            });
            setMessage({ type: "ok", text: `Created "${res.data.test.title}" with ${res.data.test.totalQuestions} questions` });
            setForm(EMPTY);
            setSections([blankSection()]);
            setShowForm(false);
            setReload((n) => n + 1);
        } catch (err) {
            setMessage({ type: "error", text: getErrorMessage(err) });
        } finally {
            setSaving(false);
        }
    };

    const remove = async (t) => {
        if (!window.confirm(`Delete "${t.title}"? Students can no longer start it, but old results stay.`)) return;
        try {
            await api.delete(`/admin/tests/${t._id}`);
            setReload((n) => n + 1);
        } catch (err) {
            setMessage({ type: "error", text: getErrorMessage(err) });
        }
    };

    return (
        <AdminLayout
            title="Mock tests"
            actions={
                examId && !showForm ? (
                    <button onClick={() => setShowForm(true)} className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:bg-indigo-700">
                        + Create test
                    </button>
                ) : null
            }
        >
            <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5 max-w-xs">
                <SyllabusPicker
                    value={{ examId }}
                    levels={["exam"]}
                    onChange={(v) => {
                        setExamId(v.examId);
                        setSections([blankSection()]);
                    }}
                />
            </div>

            {message.text && (
                <div className={`mt-4 rounded-lg text-sm px-4 py-3 ${message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <form onSubmit={create} className="mt-4 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                    <h2 className="font-semibold text-slate-900">New mock test</h2>
                    <div className="grid sm:grid-cols-4 gap-3">
                        <label className="sm:col-span-2">
                            <span className="block text-xs font-medium text-slate-600 mb-1">Title</span>
                            <input value={form.title} onChange={(e) => update("title", e.target.value)} required placeholder="e.g. NEET Full Mock 1" className={inputClass} />
                        </label>
                        <label>
                            <span className="block text-xs font-medium text-slate-600 mb-1">Type</span>
                            <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputClass}>
                                {Object.entries(TYPES).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className="block text-xs font-medium text-slate-600 mb-1">Duration (minutes)</span>
                            <input type="number" min="1" max="360" value={form.durationMinutes} onChange={(e) => update("durationMinutes", e.target.value)} className={inputClass} />
                        </label>
                        <label>
                            <span className="block text-xs font-medium text-slate-600 mb-1">Attempts allowed (0 = unlimited)</span>
                            <input type="number" min="0" value={form.maxAttempts} onChange={(e) => update("maxAttempts", e.target.value)} className={inputClass} />
                        </label>
                        <label className="sm:col-span-3">
                            <span className="block text-xs font-medium text-slate-600 mb-1">Instructions (optional)</span>
                            <input value={form.instructions} onChange={(e) => update("instructions", e.target.value)} className={inputClass} />
                        </label>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-slate-600 mb-2">Sections: random published questions are picked for each row</p>
                        <SectionRows examId={examId} sections={sections} onChange={setSections} />
                    </div>

                    <div className="flex gap-3">
                        <button disabled={saving} className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-indigo-700 disabled:opacity-60">
                            {saving ? "Creating..." : "Create test"}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-600 px-3">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-slate-500 border-b border-slate-200">
                            <th className="px-4 py-3 font-medium">Test</th>
                            <th className="px-4 py-3 font-medium">Questions</th>
                            <th className="px-4 py-3 font-medium">Time</th>
                            <th className="px-4 py-3 font-medium">Attempts</th>
                            <th className="px-4 py-3 font-medium">Top score</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {tests.map((t) => (
                            <tr key={t._id} className="border-b border-slate-100 last:border-0">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-slate-900">{t.title}</p>
                                    <p className="text-xs text-slate-500">
                                        {TYPES[t.type]} · {t.sections.map((s) => s.name).join(", ")}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                    {t.totalQuestions} ({t.totalMarks} marks)
                                </td>
                                <td className="px-4 py-3 text-slate-700">{t.durationMinutes} min</td>
                                <td className="px-4 py-3 text-slate-700">{t.stats?.attempts || 0}</td>
                                <td className="px-4 py-3 text-slate-700">{t.stats?.topScore ?? "–"}</td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => remove(t)} className="text-red-600 hover:underline">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {tests.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-4 py-6 text-center text-slate-500">
                                    No mock tests for this exam yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}