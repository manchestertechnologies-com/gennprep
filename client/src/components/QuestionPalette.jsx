import { useState } from "react";
// The grid of question numbers on the right side of the test screen
function PaletteGrid({ questions, current, answers, marked, showMarked, onJump }) {
    const isAnswered = (q) => (answers[q._id] || []).length > 0;
    const answeredCount = questions.filter(isAnswered).length;
    const markedCount = questions.filter((q) => marked[q._id]).length;

    const colorFor = (q) => {
        if (showMarked && marked[q._id]) return "bg-purple-500 text-white";
        if (isAnswered(q)) return "bg-green-500 text-white";
        return "bg-slate-100 text-slate-700";
    };

    return (
        <aside className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
            <h2 className="font-semibold text-slate-900">Questions</h2>
            <p className="text-xs text-slate-500 mt-1">
                {answeredCount} answered · {questions.length - answeredCount} left
                {showMarked ? ` · ${markedCount} marked` : ""}
            </p>

            <div className="grid grid-cols-5 gap-2 mt-4">
                {questions.map((q, index) => (
                    <button
                        key={q._id}
                        onClick={() => onJump(index)}
                        className={`relative h-9 rounded-lg text-sm font-medium ${colorFor(q)} ${index === current ? "ring-2 ring-indigo-500 ring-offset-1" : ""
                            }`}
                    >
                        {index + 1}
                        {showMarked && marked[q._id] && isAnswered(q) && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border border-white" />
                        )}
                    </button>
                ))}
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-green-500" /> Answered
                </p>
                {showMarked && (
                    <p className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-purple-500" /> Marked for review
                    </p>
                )}
                <p className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" /> Not answered
                </p>
                {showMarked && (
                    <p className="pt-1">A green dot means the marked question has an answer, and it will still be scored.</p>
                )}
            </div>
        </aside>
    );
}

// Laptop: grid on the side. Phone: floating button that opens the grid from the bottom.
export default function QuestionPalette(props) {
  const [open, setOpen] = useState(false);
  const answered = props.questions.filter((q) => (props.answers[q._id] || []).length > 0).length;

  return (
    <>
      <div className="hidden lg:block">
        <PaletteGrid {...props} />
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-300 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>
        Questions {answered}/{props.questions.length}
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex items-end bg-slate-900/50" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label="Jump to a question"
            className="w-full max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-8"
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