import { useEffect, useState } from "react";
import api from "../api/axios";

const LABELS = { exam: "Exam", subject: "Subject", chapter: "Chapter", topic: "Topic" };
const KEYS = { exam: "examId", subject: "subjectId", chapter: "chapterId", topic: "topicId" };
const PARENT = { subject: "exam", chapter: "subject", topic: "chapter" };
const ORDER = ["examId", "subjectId", "chapterId", "topicId"];
const GRID = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" };

const selectClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100";

// value = { examId, subjectId, chapterId, topicId }; onChange gets the new value
export default function SyllabusPicker({ value, onChange, levels = ["exam", "subject", "chapter"], refreshKey = 0 }) {
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [topics, setTopics] = useState([]);

    const wantChapter = levels.includes("chapter");
    const wantTopic = levels.includes("topic");

    useEffect(() => {
        api.get("/exams").then((r) => setExams(r.data.exams)).catch(() => { });
    }, []);

    useEffect(() => {
        if (!value.examId) return;
        api.get(`/exams/${value.examId}/subjects`).then((r) => setSubjects(r.data.subjects)).catch(() => { });
    }, [value.examId]);

    useEffect(() => {
        if (!value.subjectId || !wantChapter) return;
        api.get(`/subjects/${value.subjectId}/chapters`).then((r) => setChapters(r.data.chapters)).catch(() => { });
    }, [value.subjectId, wantChapter, refreshKey]);

    useEffect(() => {
        if (!value.chapterId || !wantTopic) return;
        api.get(`/chapters/${value.chapterId}/topics`).then((r) => setTopics(r.data.topics)).catch(() => { });
    }, [value.chapterId, wantTopic, refreshKey]);

    // Choosing a level clears everything below it
    const choose = (key, id) => {
        const next = { ...value, [key]: id };
        ORDER.slice(ORDER.indexOf(key) + 1).forEach((k) => {
            next[k] = "";
        });
        onChange(next);
    };

    const lists = {
        exam: exams,
        subject: value.examId ? subjects : [],
        chapter: value.subjectId ? chapters : [],
        topic: value.chapterId ? topics : [],
    };

    return (
        <div className={`grid gap-3 ${GRID[levels.length]}`}>
            {levels.map((level) => (
                <label key={level} className="block">
                    <span className="block text-xs font-medium text-slate-600 mb-1">{LABELS[level]}</span>
                    <select
                        value={value[KEYS[level]] || ""}
                        onChange={(e) => choose(KEYS[level], e.target.value)}
                        disabled={level !== "exam" && !value[KEYS[PARENT[level]]]}
                        className={selectClass}
                    >
                        <option value="">Choose {LABELS[level].toLowerCase()}</option>
                        {lists[level].map((item) => (
                            <option key={item._id} value={item._id}>
                                {item.code || item.name}
                            </option>
                        ))}
                    </select>
                </label>
            ))}
        </div>
    );
}