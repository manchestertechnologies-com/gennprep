import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const ExamContext = createContext(null);

// Shares the list of exams and the one the student picked, on every page
export function ExamProvider({ children }) {
  const [exams, setExams] = useState([]);
  const [examId, setExamIdState] = useState(localStorage.getItem("examId") || "");

  useEffect(() => {
    api
      .get("/exams")
      .then((res) => {
        const list = res.data.exams;
        setExams(list);
        // Keep the saved exam if it still exists, otherwise pick the first one
        setExamIdState((current) => {
          const next = list.some((e) => e._id === current) ? current : list[0]?._id || "";
          if (next) localStorage.setItem("examId", next);
          return next;
        });
      })
      .catch(() => {});
  }, []);

  const setExamId = (id) => {
    localStorage.setItem("examId", id);
    setExamIdState(id);
  };

  const exam = exams.find((e) => e._id === examId) || null;

  return <ExamContext.Provider value={{ exams, examId, exam, setExamId }}>{children}</ExamContext.Provider>;
}

export const useExam = () => useContext(ExamContext);