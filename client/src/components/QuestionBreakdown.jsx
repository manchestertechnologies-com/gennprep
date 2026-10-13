import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";

// Admin overview: how many questions each exam has, per subject
const fmt = (n) => n.toLocaleString("en-IN");

export default function QuestionBreakdown() {
  const [exams, setExams] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/stats/questions")
      .then((res) => setExams(res.data.exams))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Questions by exam and subject</h2>
        {exams && (
          <p className="text-sm text-slate-500">
            {fmt(exams.reduce((a, e) => a + e.published, 0))} published · {fmt(exams.reduce((a, e) => a + e.drafts, 0))} drafts
          </p>
        )}
      </div>

      {error && <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {!exams && !error && <p className="mt-3 text-sm text-slate-500">Counting questions...</p>}

      {exams && (
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {exams.map((e) => {
            const max = Math.max(1, ...e.subjects.map((s) => s.published));
            return (
              <div key={e.code} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{e.code}</h3>
                  <span className="text-2xl font-bold tabular-nums text-indigo-600">{fmt(e.published)}</span>
                </div>
                <p className="text-xs text-slate-500">
                  published questions{e.drafts ? ` · ${fmt(e.drafts)} drafts` : ""}
                </p>
                <ul className="mt-4 space-y-3">
                  {e.subjects.map((s) => (
                    <li key={s.name}>
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="font-medium text-slate-700">{s.name}</span>
                        <span className="tabular-nums text-slate-900">
                          {fmt(s.published)}
                          {s.drafts > 0 && <span className="ml-2 text-xs text-slate-400">+{fmt(s.drafts)} drafts</span>}
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(s.published / max) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                  {e.subjects.length === 0 && <li className="text-sm text-slate-500">No subjects yet</li>}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}