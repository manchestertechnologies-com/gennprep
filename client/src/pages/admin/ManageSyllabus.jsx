import { askConfirm } from "../../components/ConfirmDialog";
import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";
import SyllabusPicker from "../../components/SyllabusPicker";

const inputClass =
    "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function ManageSyllabus() {
    const [picked, setPicked] = useState({ examId: localStorage.getItem("examId") || "", subjectId: "" });
    const [chapters, setChapters] = useState([]); // each chapter has its topics attached
    const [reload, setReload] = useState(0);
    const [newChapter, setNewChapter] = useState({ name: "", classLevel: "11" });
    const [newTopic, setNewTopic] = useState({}); // chapterId -> text being typed
    const [message, setMessage] = useState({ type: "", text: "" });

    // Load the subject's chapters, each with its topics
    useEffect(() => {
        if (!picked.subjectId) return;
        let cancelled = false;
        api
            .get(`/subjects/${picked.subjectId}/chapters`)
            .then(async (res) => {
                const list = await Promise.all(
                    res.data.chapters.map(async (c) => {
                        const t = await api.get(`/chapters/${c._id}/topics`);
                        return { ...c, topics: t.data.topics };
                    })
                );
                if (!cancelled) setChapters(list);
            })
            .catch((err) => setMessage({ type: "error", text: getErrorMessage(err) }));
        return () => {
            cancelled = true;
        };
    }, [picked.subjectId, reload]);

    // Runs a server action, shows the result, then reloads the list
    const run = async (action, successText) => {
        setMessage({ type: "", text: "" });
        try {
            await action();
            setMessage({ type: "ok", text: successText });
            setReload((n) => n + 1);
            return true;
        } catch (err) {
            setMessage({ type: "error", text: getErrorMessage(err) });
            return false;
        }
    };

    const addChapter = async (e) => {
        e.preventDefault();
        const ok = await run(
            () => api.post("/admin/chapters", { subjectId: picked.subjectId, ...newChapter }),
            `Chapter "${newChapter.name}" added`
        );
        if (ok) setNewChapter({ name: "", classLevel: newChapter.classLevel });
    };

    const renameChapter = (c) => {
        const name = window.prompt("New chapter name", c.name);
        if (name && name.trim() && name !== c.name) run(() => api.put(`/admin/chapters/${c._id}`, { name }), "Chapter renamed");
    };

    const removeChapter = async (c) => {
        if (await askConfirm(`Remove "${c.name}"? Its questions stay in the bank, but students won't see the chapter.`)) {
            run(() => api.delete(`/admin/chapters/${c._id}`), "Chapter removed");
        }
    };

    const addTopic = async (c) => {
        const name = (newTopic[c._id] || "").trim();
        if (!name) return;
        const ok = await run(() => api.post("/admin/topics", { chapterId: c._id, name }), `Topic "${name}" added`);
        if (ok) setNewTopic((prev) => ({ ...prev, [c._id]: "" }));
    };

    const removeTopic = async (t) => {
        if (await askConfirm(`Remove topic "${t.name}"?`)) run(() => api.delete(`/admin/topics/${t._id}`), "Topic removed");
    };

    return (
        <AdminLayout title="Syllabus">
            <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
                <SyllabusPicker
                    value={picked}
                    levels={["exam", "subject"]}
                    onChange={(v) => {
                        setPicked(v);
                        setChapters([]);
                    }}
                />
            </div>

            {message.text && (
                <div className={`mt-4 rounded-lg text-sm px-4 py-3 ${message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {message.text}
                </div>
            )}

            {!picked.subjectId && <p className="mt-6 text-slate-500">Choose an exam and a subject to see its chapters.</p>}

            {picked.subjectId && (
                <>
                    <form onSubmit={addChapter} className="mt-4 bg-white rounded-xl border border-slate-200 p-5 flex flex-wrap gap-3 items-end">
                        <label className="flex-1 min-w-48">
                            <span className="block text-xs font-medium text-slate-600 mb-1">New chapter</span>
                            <input
                                value={newChapter.name}
                                onChange={(e) => setNewChapter({ ...newChapter, name: e.target.value })}
                                placeholder="e.g. Laws of Motion"
                                required
                                className={`w-full ${inputClass}`}
                            />
                        </label>
                        <label>
                            <span className="block text-xs font-medium text-slate-600 mb-1">Class</span>
                            <select value={newChapter.classLevel} onChange={(e) => setNewChapter({ ...newChapter, classLevel: e.target.value })} className={inputClass}>
                                <option value="11">11</option>
                                <option value="12">12</option>
                            </select>
                        </label>
                        <button className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:bg-indigo-700">Add chapter</button>
                    </form>

                    {chapters.length === 0 && <p className="mt-6 text-slate-500">No chapters yet for this subject.</p>}

                    <div className="mt-4 space-y-3">
                        {chapters.map((c) => (
                            <article key={c._id} className="bg-white rounded-xl border border-slate-200 p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-semibold text-slate-900">{c.name}</h2>
                                    <span className="text-xs text-slate-500">Class {c.classLevel}</span>
                                    <div className="ml-auto flex gap-3 text-sm">
                                        <button onClick={() => renameChapter(c)} className="text-indigo-600 hover:underline">Rename</button>
                                        <button onClick={() => removeChapter(c)} className="text-red-600 hover:underline">Remove</button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-3">
                                    {c.topics.map((t) => (
                                        <span key={t._id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                                            {t.name}
                                            <button onClick={() => removeTopic(t)} className="text-slate-400 hover:text-red-600" title="Remove topic">
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    {c.topics.length === 0 && <span className="text-sm text-slate-400">No topics yet</span>}
                                </div>

                                <div className="flex gap-2 mt-3">
                                    <input
                                        value={newTopic[c._id] || ""}
                                        onChange={(e) => setNewTopic({ ...newTopic, [c._id]: e.target.value })}
                                        onKeyDown={(e) => e.key === "Enter" && addTopic(c)}
                                        placeholder="New topic"
                                        className={`flex-1 ${inputClass}`}
                                    />
                                    <button onClick={() => addTopic(c)} className="rounded-lg border border-slate-300 text-sm font-medium px-3 py-2 hover:border-slate-400">
                                        Add topic
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </>
            )}
        </AdminLayout>
    );
}