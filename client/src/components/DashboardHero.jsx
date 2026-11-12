import { useState } from "react";
import { Link } from "react-router-dom";

const GOALS = [10, 20, 30, 50];

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const readGoal = () => {
  try {
    return Number(localStorage.getItem("dailyGoal")) || 20;
  } catch {
    return 20;
  }
};

// Ring that fills as today's questions get closer to the goal
function GoalRing({ done, goal }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const filled = Math.min(done / goal, 1) * c;
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(229,195,114,0.18)" strokeWidth="7" />
        {filled > 0 && <circle cx="40" cy="40" r={r} fill="none" stroke="#e5c372" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${filled} ${c}`} />}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-xl font-extrabold leading-none text-[#f2d68e]">{done}</span>
        <span className="text-[11px] text-[#cbbf9f]">of {goal}</span>
      </div>
    </div>
  );
}

// Big welcome banner with today's goal
export function WelcomeBanner({ name, examCode, today }) {
  const [goal, setGoal] = useState(readGoal);
  const changeGoal = (value) => {
    setGoal(value);
    try {
      localStorage.setItem("dailyGoal", value);
    } catch {
      /* ignore */
    }
  };
  const done = today?.attempted || 0;
  const first = (name || "").trim().split(" ")[0];
  const firstName = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#b8862b]/60 bg-[#17140f] bg-[radial-gradient(600px_260px_at_90%_-20%,rgba(229,195,114,0.18),transparent_60%)] p-6 md:p-8 text-[#f7f3ea] shadow-[0_18px_40px_-24px_rgba(23,20,15,0.8)] flex flex-col md:flex-row md:items-center gap-6">
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e5c372]">{examCode} preparation</p>
        <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-[#fffdf8]">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-2 text-[#cbbf9f]">
          {done >= goal ? "You reached today's goal. Great work!" : `${goal - done} more questions to reach today's goal.`}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/practice" className="rounded-lg bg-[#e5c372] text-[#17140f] text-sm font-semibold px-5 py-2.5 hover:bg-[#f2d68e]">
            Start practice
          </Link>
          <Link to="/mock-tests" className="rounded-lg border border-[#e5c372]/50 text-[#f2d68e] text-sm font-semibold px-5 py-2.5 hover:bg-[#e5c372]/10">
            Take a mock test
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-[#e5c372]/20 bg-[#e5c372]/[0.06] px-5 py-4">
        <GoalRing done={done} goal={goal} />
        <div>
          <p className="font-semibold text-[#fffdf8]">Today's goal</p>
          <p className="text-xs text-[#cbbf9f]">questions per day</p>
          <select
            value={goal}
            onChange={(e) => changeGoal(Number(e.target.value))}
            aria-label="Daily goal"
            className="mt-2 rounded-md border border-[#e5c372]/40 !bg-[#26211a] px-2 py-1 text-sm !text-[#f2d68e] focus:outline-none"
          >
            {GOALS.map((g) => (
              <option key={g} value={g} className="text-slate-900">
                {g} a day
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

const ACTIONS = [
  { to: "/practice", label: "Practice", text: "Chapter-wise questions", icon: "M5 4h11l3 3v13H5zM9 10h6M9 14h6", tone: "bg-[#fbf5e7] text-[#8f6215]" },
  { to: "/mock-tests", label: "Mock tests", text: "Timed full tests", icon: "M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z", tone: "bg-[#fbf5e7] text-[#8f6215]" },
  { to: "/revise", label: "Revise", text: "Your mistakes", icon: "M4 4v6h6M20 20v-6h-6M5.5 15a7.5 7.5 0 0013.5 2M18.5 9A7.5 7.5 0 005 7", tone: "bg-[#fbf5e7] text-[#8f6215]", badge: true },
  { to: "/analytics", label: "Analytics", text: "See your progress", icon: "M4 20V10M10 20V4M16 20v-6M2 20h20", tone: "bg-[#fbf5e7] text-[#8f6215]" },
];

// 4 big cards to jump to the main areas
export function QuickActions({ wrongCount }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
      {ACTIONS.map((a) => (
        <Link
          key={a.to}
          to={a.to}
          className="group relative flex items-center gap-3 rounded-2xl bg-white border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition"
        >
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${a.tone}`}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={a.icon} />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-slate-900">{a.label}</span>
            <span className="block truncate text-xs text-slate-500">{a.text}</span>
          </span>
          {a.badge && wrongCount > 0 && (
            <span className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">{wrongCount}</span>
          )}
        </Link>
      ))}
    </div>
  );
}