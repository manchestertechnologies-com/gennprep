import { useEffect } from "react";
import { STATUS } from "./testStatus";

const ORDER = ["answered", "notAnswered", "notVisited", "marked", "answeredMarked"];

// The "are you sure?" box with a count of every question status
export default function SubmitSummary({ counts, total, submitting, onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const left = counts.notAnswered + counts.notVisited + counts.marked;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="submit-title"
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="submit-title" className="text-lg font-bold text-slate-900">Submit your test?</h2>
        <p className="mt-1 text-sm text-slate-500">
          {left > 0 ? `${left} of ${total} questions will not be scored.` : "You have answered every question."} You can't change answers after submitting.
        </p>

        <ul className="mt-5 space-y-2">
          {ORDER.map((key) => (
            <li key={key} className="flex items-center gap-3 text-sm">
              <span className={`w-7 h-7 rounded-md border-2 flex items-center justify-center text-xs font-bold ${STATUS[key].cls}`}>
                {counts[key]}
              </span>
              <span className="text-slate-700">{STATUS[key].label}</span>
            </li>
          ))}
        </ul>
        {counts.answeredMarked > 0 && (
          <p className="mt-3 text-xs text-slate-500">"Answered & marked" questions will still be scored.</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2 hover:bg-slate-50">
            Back to test
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            autoFocus
            className="rounded-lg bg-indigo-600 text-white text-sm font-semibold px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Yes, submit"}
          </button>
        </div>
      </div>
    </div>
  );
}