// Question status on the test screen, like the real NTA exam
export const STATUS = {
  answered: { label: "Answered", cls: "bg-emerald-500 text-white border-emerald-500" },
  notAnswered: { label: "Not answered", cls: "bg-red-500 text-white border-red-500" },
  notVisited: { label: "Not visited", cls: "bg-white text-slate-700 border-slate-300" },
  marked: { label: "Marked for review", cls: "bg-violet-500 text-white border-violet-500" },
  answeredMarked: { label: "Answered & marked", cls: "bg-violet-500 text-white border-violet-500" },
};

export const statusOf = (q, answers, marked, visited) => {
  const answered = (answers[q._id] || []).length > 0;
  if (marked[q._id]) return answered ? "answeredMarked" : "marked";
  if (answered) return "answered";
  return visited[q._id] ? "notAnswered" : "notVisited";
};

export const countStatuses = (questions, answers, marked, visited) => {
  const counts = { answered: 0, notAnswered: 0, notVisited: 0, marked: 0, answeredMarked: 0 };
  questions.forEach((q) => (counts[statusOf(q, answers, marked, visited)] += 1));
  return counts;
};