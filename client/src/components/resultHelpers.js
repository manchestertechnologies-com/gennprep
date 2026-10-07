// 200 -> "3 min 20s"
export const formatTime = (seconds = 0) => {
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  return m ? `${m} min ${s % 60}s` : `${s}s`;
};

// isCorrect is true, false, or null (not answered)
export const verdictOf = (item) =>
  item.isCorrect === null || item.isCorrect === undefined ? "skipped" : item.isCorrect ? "correct" : "wrong";

export const VERDICT = {
  correct: { label: "Correct", badge: "bg-emerald-50 text-emerald-700", square: "bg-emerald-500 text-white", edge: "border-l-emerald-500" },
  wrong: { label: "Wrong", badge: "bg-red-50 text-red-700", square: "bg-red-500 text-white", edge: "border-l-red-500" },
  skipped: { label: "Skipped", badge: "bg-slate-100 text-slate-600", square: "bg-white text-slate-600 border border-slate-300", edge: "border-l-slate-300" },
};