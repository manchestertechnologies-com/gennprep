import { Link } from "react-router-dom";

const ICONS = {
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4",
  book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 5v16M8 7h7",
  alert: "M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z",
};

// A friendly "nothing here yet" box with an icon, a message and an optional button
export default function EmptyState({ icon = "book", title, text, actionLabel, actionTo, onAction, children }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={ICONS[icon] || ICONS.book} />
        </svg>
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
      {text && <p className="mt-1 max-w-md text-sm text-slate-500">{text}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button onClick={onAction} className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  );
}