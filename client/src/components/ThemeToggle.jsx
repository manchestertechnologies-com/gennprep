import { useState } from "react";

// Sun / moon button that switches between light and dark mode (remembered on this device)
export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {dark ? (
          <path d="M12 4V2M12 22v-2M4.9 4.9L3.5 3.5M20.5 20.5l-1.4-1.4M4 12H2M22 12h-2M4.9 19.1l-1.4 1.4M20.5 3.5l-1.4 1.4M12 8a4 4 0 100 8 4 4 0 000-8z" />
        ) : (
          <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
        )}
      </svg>
    </button>
  );
}