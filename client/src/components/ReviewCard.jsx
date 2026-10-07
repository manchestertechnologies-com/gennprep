import MathText from "./MathText";
import { VERDICT, formatTime, verdictOf } from "./resultHelpers";

const Star = ({ on }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" />
  </svg>
);

// One question in the answer review
export default function ReviewCard({ item, isBookmarked, onBookmark }) {
  const verdict = verdictOf(item);
  const v = VERDICT[verdict];
  const correctIds = item.correctOptionIds || [];
  const chosenIds = item.selectedOptionIds || [];

  return (
    <article id={`q-${item.number}`} className={`scroll-mt-24 bg-white rounded-2xl border border-slate-200 border-l-4 ${v.edge} shadow-sm p-5`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold text-slate-900">Q{item.number}</span>
        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${v.badge}`}>{v.label}</span>
        <span className="text-xs text-slate-500">
          {item.marksAwarded > 0 ? `+${item.marksAwarded}` : item.marksAwarded} marks &middot; {formatTime(item.timeSpentSec)}
        </span>
        <button
          onClick={onBookmark}
          className={`ml-auto flex items-center gap-1 text-sm font-medium ${isBookmarked ? "text-amber-600" : "text-slate-400 hover:text-slate-700"}`}
        >
          <Star on={isBookmarked} />
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      </div>

      <MathText as="p" className="mt-3 text-slate-900 leading-relaxed whitespace-pre-line" text={item.text} />
      {item.images?.map((img) => (
        <img key={img.url} src={img.url} alt={img.alt || "Question diagram"} className="mt-3 max-h-64 rounded-lg border border-slate-200" />
      ))}

      <div className="mt-4 space-y-2">
        {item.options.map((opt) => {
          const isCorrect = correctIds.includes(opt.id);
          const isChosen = chosenIds.includes(opt.id);
          let box = "border-slate-200";
          let dot = "bg-slate-100 text-slate-700";
          if (isCorrect) { box = "border-emerald-500 bg-emerald-50"; dot = "bg-emerald-500 text-white"; }
          else if (isChosen) { box = "border-red-500 bg-red-50"; dot = "bg-red-500 text-white"; }
          return (
            <div key={opt.id} className={`flex items-start gap-3 rounded-xl border-2 px-3 py-2.5 ${box}`}>
              <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${dot}`}>{opt.id}</span>
              <span className="flex-1 pt-0.5 text-slate-800">
                <MathText text={opt.text} />
                {opt.image?.url && <img src={opt.image.url} alt={`Option ${opt.id}`} className="mt-2 max-h-32 rounded" />}
              </span>
              {isCorrect && <span className="pt-1 text-xs font-semibold text-emerald-700">{isChosen ? "Your answer, correct" : "Correct answer"}</span>}
              {isChosen && !isCorrect && <span className="pt-1 text-xs font-semibold text-red-700">Your answer</span>}
            </div>
          );
        })}
      </div>

      {item.explanation?.text && (
        <details className="mt-4 rounded-xl bg-indigo-50 px-4 py-3" open={verdict !== "correct"}>
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-indigo-700">Explanation</summary>
          <MathText as="p" className="mt-2 text-sm text-slate-800 leading-relaxed whitespace-pre-line" text={item.explanation.text} />
        </details>
      )}
    </article>
  );
}