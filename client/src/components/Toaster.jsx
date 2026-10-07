import { useEffect, useState } from "react";

let push = null; // set while the Toaster is on the page
let nextId = 1;

// Show a short message from anywhere:  toast("Saved")  or  toast("Could not save", "error")
export function toast(text, type = "success") {
  if (push) push({ id: nextId++, text, type });
}

const STYLES = {
  success: { icon: "M5 12l5 5 9-10", dot: "bg-emerald-500" },
  error: { icon: "M12 8v5M12 16.5v.5", dot: "bg-red-500" },
  info: { icon: "M12 11v6M12 7.5v.5", dot: "bg-indigo-500" },
};

function Toast({ item, onClose }) {
  const [shown, setShown] = useState(false);
  const life = item.type === "error" ? 4500 : 3000;

  useEffect(() => {
    const show = requestAnimationFrame(() => setShown(true));
    const hide = setTimeout(() => setShown(false), life);
    const remove = setTimeout(onClose, life + 300);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const s = STYLES[item.type] || STYLES.info;
  return (
    <div
      role={item.type === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl transition duration-300 ${
        shown ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-white ${s.dot}`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d={s.icon} />
        </svg>
      </span>
      <span className="flex-1">{item.text}</span>
      <button onClick={onClose} aria-label="Close" className="text-lg leading-none opacity-60 hover:opacity-100">&times;</button>
    </div>
  );
}

// Put once on the page (in main.jsx). Shows up to 3 messages at a time.
export default function Toaster() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    push = (item) => setItems((list) => [...list.slice(-2), item]);
    const offline = () => toast("You're offline. Your answers are kept on this device.", "error");
    const online = () => toast("Back online", "info");
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      push = null;
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, []);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-4">
      {items.map((item) => (
        <Toast key={item.id} item={item} onClose={() => setItems((list) => list.filter((x) => x.id !== item.id))} />
      ))}
    </div>
  );
}