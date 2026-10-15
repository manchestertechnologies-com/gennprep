import { useEffect, useRef, useState } from "react";

export const MAX_WARNINGS = 3;

// Exam rules for mock tests:
//  - leaving the tab / app or full screen gives a warning; the last one submits the test
//  - copy, cut, paste, right-click and text selection are blocked
export default function useAntiCheat({ active, attemptId, onLimit }) {
  const key = `warnings-${attemptId}`;
  const [warnings, setWarnings] = useState(() => {
    try {
      return Number(localStorage.getItem(key)) || 0;
    } catch {
      return 0;
    }
  });
  const [showWarning, setShowWarning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(() => Boolean(document.fullscreenElement));
  const lastHit = useRef(0);
  const limitRef = useRef(onLimit);
  limitRef.current = onLimit;

  // One warning per event, even when the browser fires several (blur + hidden + leaving full screen)
  const hit = () => {
    const now = Date.now();
    if (now - lastHit.current < 2500) return;
    lastHit.current = now;
    setWarnings((w) => {
      const next = w + 1;
      try {
        localStorage.setItem(key, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    setShowWarning(true);
  };

  // Always know whether we are in full screen (the request can finish after this page opens)
  useEffect(() => {
    const sync = () => setIsFullScreen(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    if (active && warnings >= MAX_WARNINGS) limitRef.current?.();
  }, [active, warnings]);

  useEffect(() => {
    if (!active) return;
    const onHidden = () => document.hidden && hit();
    const onBlur = () => hit();
    const onFull = () => {
      if (!document.fullscreenElement) hit();
    };
    const block = (e) => e.preventDefault();
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["c", "x", "v", "a", "u", "s", "p"].includes(k)) e.preventDefault();
      if (k === "f12") e.preventDefault();
    };

    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFull);
    ["copy", "cut", "paste", "contextmenu", "dragstart", "selectstart"].forEach((t) => document.addEventListener(t, block));
    document.addEventListener("keydown", onKey);
    document.body.classList.add("select-none");
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFull);
      ["copy", "cut", "paste", "contextmenu", "dragstart", "selectstart"].forEach((t) => document.removeEventListener(t, block));
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("select-none");
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  // Leave full screen when the test ends
  useEffect(() => {
    if (active) return;
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }, [active]);

  const enterFullScreen = () => {
    const el = document.documentElement;
    const fn = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!fn) return;
    try {
      const p = fn.call(el);
      if (p && p.catch) p.catch(() => {});
    } catch {
      /* not allowed on this device */
    }
  };

  const canFullScreen = Boolean(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);

  return {
    warnings,
    showWarning,
    closeWarning: () => setShowWarning(false),
    needsFullScreen: active && canFullScreen && !isFullScreen,
    enterFullScreen,
  };
}

// Pop-up shown after a warning, and a cover asking to go back to full screen
export function ExamGuard({ guard, onFullScreen }) {
  if (guard.showWarning) {
    const left = MAX_WARNINGS - guard.warnings;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center">
          <p className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-100 text-3xl font-black text-red-600">!</p>
          <h2 className="mt-2 text-xl font-bold text-red-600">
            Warning {Math.min(guard.warnings, MAX_WARNINGS)} of {MAX_WARNINGS}
          </h2>
          <p className="mt-2 text-slate-700">
            You left the test screen. {left > 0 ? `${left} more and your test will be submitted automatically.` : "Your test is being submitted."}
          </p>
          {left > 0 && (
            <button
              onClick={() => {
                guard.closeWarning();
                onFullScreen();
              }}
              className="mt-5 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Back to my test
            </button>
          )}
        </div>
      </div>
    );
  }
  if (guard.needsFullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center">
          <h2 className="text-xl font-bold text-slate-900">Full screen is needed</h2>
          <p className="mt-2 text-slate-600">The mock test runs in full screen. Your timer is still running.</p>
          <button onClick={onFullScreen} className="mt-5 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Continue in full screen
          </button>
        </div>
      </div>
    );
  }
  return null;
}