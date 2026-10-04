import { useEffect, useState } from "react";
import api from "../api/axios";

const selectClass = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

// Editable rows: each row = subject + optional chapter + how many random questions
export default function SectionRows({ examId, sections, onChange }) {
    const [subjects, setSubjects] = useState([]);
    const [chaptersBySubject, setChaptersBySubject] = useState({});

    useEffect(() => {
        if (!examId) return;
        api.get(`/exams/${examId}/subjects`).then((r) => setSubjects(r.data.subjects)).catch(() => { });
    }, [examId]);

    const loadChapters = (subjectId) => {
        if (!subjectId || chaptersBySubject[subjectId]) return;
        api
            .get(`/subjects/${subjectId}/chapters`)
            .then((r) => setChaptersBySubject((prev) => ({ ...prev, [subjectId]: r.data.chapters })))
            .catch(() => { });
    };

    const updateRow = (index, changes) => onChange(sections.map((s, i) => (i === index ? { ...s, ...changes } : s)));

    const changeSubject = (index, subjectId) => {
        updateRow(index, { subjectId, chapterId: "" });
        loadChapters(subjectId);
    };

    return (
        <div className="space-y-2">
            {sections.map((s, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2">
                    <select value={s.subjectId} onChange={(e) => changeSubject(index, e.target.value)} className={selectClass} required>
                        <option value="">Subject</option>
                        {subjects.map((sub) => (
                            <option key={sub._id} value={sub._id}>
                                {sub.name}
                            </option>
                        ))}
                    </select>

                    <select value={s.chapterId} onChange={(e) => updateRow(index, { chapterId: e.target.value })} disabled={!s.subjectId} className={selectClass}>
                        <option value="">All chapters</option>
                        {(chaptersBySubject[s.subjectId] || []).map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min="1"
                        max="200"
                        value={s.count}
                        onChange={(e) => updateRow(index, { count: e.target.value })}
                        className={`${selectClass} w-24`}
                        title="Number of questions"
                    />
                    <span className="text-sm text-slate-500">questions</span>

                    {sections.length > 1 && (
                        <button type="button" onClick={() => onChange(sections.filter((_, i) => i !== index))} className="text-sm text-red-600 hover:underline">
                            Remove
                        </button>
                    )}
                </div>
            ))}

            <button
                type="button"
                onClick={() => onChange([...sections, { subjectId: "", chapterId: "", count: 10 }])}
                className="text-sm font-medium text-indigo-600 hover:underline"
            >
                + Add section
            </button>
        </div>
    );
}