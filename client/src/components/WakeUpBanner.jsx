import { useEffect, useState } from "react";

// Shown while the free server is waking up (any request slower than 4 seconds)
export default function WakeUpBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onSlow = (event) => setShow(event.detail);
    window.addEventListener("server-slow", onSlow);
    return () => window.removeEventListener("server-slow", onSlow);
  }, []);

  if (!show) return null;

  return (
    <div role="status" className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="flex items-center gap-3 rounded-xl bg-slate-900 text-white text-sm px-4 py-3 shadow-lg max-w-md">
        <span className="w-4 h-4 shrink-0 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        <span>Waking up the server. On the free plan this can take up to a minute, so please keep this page open.</span>
      </div>
    </div>
  );
}