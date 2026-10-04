import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";
import SyllabusPicker from "../../components/SyllabusPicker";

const selectClass = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
const STATUS_STYLES = {
    published: "bg-green-50 text-green-700",
    draft: "bg-amber-50 text-amber-700",
    archived: "bg-slate-100 text-slate-500",
};

export default function ManageQuestions() {
    const [filters, setFilters] = useState({
        examId: localStorage.getItem("examId") || "",
        subjectId: "",
        chapterId: "",
        difficulty: "",
        status: "",
    });
    const [page, setPage] = useState(1);
    const [data, setData] = useState({ questions: [], total: 0, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const params = { page, limit: 20 };
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params[key] = value;
        });
        api
            .get("/admin/questions", { params })
            .then((res) => {
                setData(res.data);
                setError("");
            })
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, [filters, page, reload]);

    const changeFilters = (next) => {
        setLoading(true);
        setPage(1);
        setFilters(next);
    };

    const remove = async (q) => {
        if (!window.confirm("Delete this question? Students won't see it, but old results keep it.")) return;
        try {
            await api.delete(`/admin/questions/${q._id}`);
            setReload((n) => n + 1);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <AdminLayout
            title="Questions"
            actions={
                <Link to="/admin/questions/new" className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:bg-indigo-700">
                    + Add question
                </Link>
            }
        >
            <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <SyllabusPicker value={filters} onChange={(v) => changeFilters({ ...filters, ...v })} />
                <div className="flex flex-wrap gap-3">
                    <select value={filters.difficulty} onChange={(e) => changeFilters({ ...filters, difficulty: e.target.value })} className={selectClass}>
                        <option value="">Any difficulty</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    <select value={filters.status} onChange={(e) => changeFilters({ ...filters, status: e.target.value })} className={selectClass}>
                        <option value="">Published and drafts</option>
                        <option value="published">Published only</option>
                        <option value="draft">Drafts only</option>
                        <option value="archived">Deleted</option>
                    </select>
                </div>
            </div>

            {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

            <p className="mt-4 text-sm text-slate-500">{data.total} question(s)</p>

            {loading ? (
                <p className="mt-2 text-slate-500">Loading...</p>
            ) : (
                <div className="mt-2 space-y-2">
                    {data.questions.map((q) => (
                        <article key={q._id} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-4 items-start">
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-900 line-clamp-2">{q.text}</p>
                                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                    <span className={`px-2 py-0.5 rounded-md font-medium ${STATUS_STYLES[q.status] || ""}`}>{q.status}</span>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">{q.difficulty}</span>
                                    <span className="text-slate-500">Answer: {(q.correctOptionIds || []).join(", ")}</span>
                                    <span className="text-slate-500">
                                        {q.stats?.attempts
                                            ? `${Math.round((q.stats.correct / q.stats.attempts) * 100)}% correct of ${q.stats.attempts} tries`
                                            : "Not attempted yet"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3 text-sm shrink-0">
                                <Link to={`/admin/questions/${q._id}`} className="text-indigo-600 hover:underline">
                                    Edit
                                </Link>
                                {q.status !== "archived" && (
                                    <button onClick={() => remove(q)} className="text-red-600 hover:underline">
                                        Delete
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                    {data.questions.length === 0 && <p className="text-slate-500">No questions match these filters.</p>}
                </div>
            )}

            {data.pages > 1 && (
                <div className="flex items-center gap-3 mt-4 text-sm">
                    <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">
                        ← Previous
                    </button>
                    <span className="text-slate-600">
                        Page {page} of {data.pages}
                    </span>
                    <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.pages} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">
                        Next →
                    </button>
                </div>
            )}
        </AdminLayout>
    );
}