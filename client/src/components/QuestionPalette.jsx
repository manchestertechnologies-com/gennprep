import { useState } from "react";
import { STATUS, countStatuses, statusOf } from "./testStatus";

const ORDER = ["answered", "notAnswered", "notVisited", "marked", "answeredMarked"];

// The grid of question numbers, coloured like the real exam
function PaletteGrid({ questions, current, answers, marked, visited, onJump }) {
  const counts = countStatuses(questions, answers, marked, visited);

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-fit">
      <h2 className="font-semibold text-slate-900">Question palette</h2>

      <div className="grid grid-cols-5 gap-2 mt-4">
        {questions.map((q, index) => {
          const status = statusOf(q, answers, marked, visited);
          return (
            <button
              key={q._id}
              onClick={() => onJump(index)}
              aria-label={`Question ${index + 1}: ${STATUS[status].label}`}
              className={`relative h-10 rounded-lg border-2 text-sm font-semibold ${STATUS[status].cls} ${
                index === current ? "ring-2 ring-indigo-500 ring-offset-2" : ""
              }`}
            >
              {index + 1}
              {status === "answeredMarked" && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white text-[9px] leading-3 text-white">&#10003;</span>
              )}
            </button>
          );
        })}
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-1.5 text-xs text-slate-600">
        {ORDER.map((key) => (
          <li key={key} className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] font-bold ${STATUS[key].cls}`}>{counts[key]}</span>
            {STATUS[key].label}
          </li>
        ))}
      </ul>
    </aside>
  );
}

// Laptop: grid on the side. Phone: floating button that opens the grid from the bottom.
export default function QuestionPalette(props) {
  const [open, setOpen] = useState(false);
  const answered = props.questions.filter((q) => (props.answers[q._id] || []).length > 0).length;

  return (
    <>
      <div className="hidden lg:block lg:sticky lg:top-24">
        <PaletteGrid {...props} />
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-30 flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>
        {answered}/{props.questions.length}
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex items-end bg-slate-900/50" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label="Jump to a question"
            className="w-full max-h-[80vh] overflow-y-auto rounded-t-2xl bg-slate-50 p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300" />
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-slate-900">Jump to a question</p>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1 text-2xl leading-none text-slate-500 hover:bg-slate-100" aria-label="Close">&times;</button>
            </div>
            <PaletteGrid
              {...props}
              onJump={(...args) => {
                props.onJump(...args);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}