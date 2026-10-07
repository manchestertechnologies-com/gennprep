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
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="7" />
        {filled > 0 && <circle cx="40" cy="40" r={r} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${filled} ${c}`} />}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-xl font-extrabold leading-none">{done}</span>
        <span className="text-[11px] opacity-80">of {goal}</span>
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
    <section className="rounded-2xl bg-linear-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 md:p-8 text-white shadow-lg shadow-indigo-200 flex flex-col md:flex-row md:items-center gap-6">
      <div className="flex-1">
        <p className="text-sm font-medium text-indigo-100">{examCode} preparation</p>
        <h1 className="mt-1 text-2xl md:text-3xl font-extrabold">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-2 text-indigo-100">
          {done >= goal ? "You reached today's goal. Great work!" : `${goal - done} more questions to reach today's goal.`}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/practice" className="rounded-lg bg-white text-indigo-700 text-sm font-semibold px-5 py-2.5 hover:bg-indigo-50">
            Start practice
          </Link>
          <Link to="/mock-tests" className="rounded-lg border border-white/40 text-white text-sm font-semibold px-5 py-2.5 hover:bg-white/10">
            Take a mock test
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-xl bg-white/10 px-5 py-4">
        <GoalRing done={done} goal={goal} />
        <div>
          <p className="font-semibold">Today's goal</p>
          <p className="text-xs text-indigo-100">questions per day</p>
          <select
            value={goal}
            onChange={(e) => changeGoal(Number(e.target.value))}
            aria-label="Daily goal"
            className="mt-2 rounded-md bg-white/20 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white"
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
  { to: "/practice", label: "Practice", text: "Chapter-wise questions", icon: "M5 4h11l3 3v13H5zM9 10h6M9 14h6", tone: "bg-indigo-50 text-indigo-600" },
  { to: "/mock-tests", label: "Mock tests", text: "Timed full tests", icon: "M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z", tone: "bg-amber-50 text-amber-600" },
  { to: "/revise", label: "Revise", text: "Your mistakes", icon: "M4 4v6h6M20 20v-6h-6M5.5 15a7.5 7.5 0 0013.5 2M18.5 9A7.5 7.5 0 005 7", tone: "bg-red-50 text-red-600", badge: true },
  { to: "/analytics", label: "Analytics", text: "See your progress", icon: "M4 20V10M10 20V4M16 20v-6M2 20h20", tone: "bg-emerald-50 text-emerald-600" },
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