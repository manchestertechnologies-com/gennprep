import { useEffect, useRef, useState } from "react";

let openDialog = null; // set while the dialog component is on the page

// Use like window.confirm, but with await:  if (!(await askConfirm("Delete this?"))) return;
export function askConfirm(message, options = {}) {
  if (!openDialog) return Promise.resolve(window.confirm(message)); // fallback
  return new Promise((resolve) => openDialog({ message, ...options, resolve }));
}

export default function ConfirmDialog() {
  const [request, setRequest] = useState(null);
  const confirmButton = useRef(null);

  useEffect(() => {
    openDialog = setRequest;
    return () => {
      openDialog = null;
    };
  }, []);

  const close = (answer) => {
    request?.resolve(answer);
    setRequest(null);
  };

  // Focus the main button, and let Esc cancel
  useEffect(() => {
    if (!request) return;
    confirmButton.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [request]);

  if (!request) return null;

  // Risky actions get a red button
  const danger = request.danger ?? /delete|remove|suspend/i.test(request.message);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => close(false)}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">
          {request.title || "Are you sure?"}
        </h2>
        <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{request.message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => close(false)}
            className="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2 hover:bg-slate-50"
          >
            {request.cancelText || "Cancel"}
          </button>
          <button
            ref={confirmButton}
            onClick={() => close(true)}
            className={`rounded-lg text-white text-sm font-medium px-4 py-2 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {request.confirmText || (danger ? "Yes, do it" : "Yes, continue")}
          </button>
        </div>
      </div>
    </div>
  );
}