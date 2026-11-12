const card = "bg-white rounded-2xl border border-slate-200 shadow-sm p-5";

// 570 seconds -> "10 min", 4000 -> "1 h 7 min"
const formatTime = (seconds = 0) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
};
const weekday = (date) => new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" });

const ICONS = {
  solved: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  accuracy: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8z",
  streak: "M12 3c1 3 4 5 4 9a4 4 0 01-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z",
  tests: "M5 4h11l3 3v13H5zM9 10h6M9 14h6",
};

function StatCard({ label, value, hint, icon, tone }) {
  return (
    <div className={card + " flex items-start gap-3"}>
      <span className={`hidden sm:grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={ICONS[icon]} />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {hint && <p className="text-xs text-slate-400 truncate">{hint}</p>}
      </div>
    </div>
  );
}

// The 4 number cards
export function StatsRow({ totals, streak }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
      <StatCard icon="solved" tone="bg-[#fbf5e7] text-[#8f6215]" label="Questions solved" value={totals.attempted} hint={`${totals.correct} correct`} />
      <StatCard icon="accuracy" tone="bg-[#fbf5e7] text-[#8f6215]" label="Accuracy" value={`${Math.round((totals.accuracy || 0) * 10) / 10}%`} hint="correct out of attempted" />
      <StatCard icon="streak" tone="bg-[#fbf5e7] text-[#8f6215]" label="Streak" value={`${streak.current} ${streak.current === 1 ? "day" : "days"}`} hint={`Longest: ${streak.longest} days`} />
      <StatCard icon="tests" tone="bg-[#fbf5e7] text-[#8f6215]" label="Tests taken" value={totals.testsTaken} hint={`${formatTime(totals.timeSec)} practised`} />
    </div>
  );
}

// Last 7 days: light = attempted, dark = correct
export function WeeklyChart({ days }) {
  const max = Math.max(1, ...days.map((d) => d.attempted));
  return (
    <div className={card}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Last 7 days</h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-indigo-500" /> Correct</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-indigo-100" /> Attempted</span>
        </div>
      </div>
      <div className="flex items-end gap-3 h-44 mt-4">
        {days.map((d, i) => {
          const isToday = i === days.length - 1;
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center h-full">
              <span className="text-xs font-semibold text-slate-700 mb-1">{d.attempted || ""}</span>
              <div className="w-full flex-1 flex items-end">
                {d.attempted > 0 ? (
                  <div className="w-full rounded-t-md bg-indigo-100 flex flex-col justify-end overflow-hidden" style={{ height: `${(d.attempted / max) * 100}%` }} title={`${d.attempted} attempted, ${d.correct} correct`}>
                    <div className="w-full bg-indigo-500" style={{ height: `${(d.correct / d.attempted) * 100}%` }} />
                  </div>
                ) : (
                  <div className="w-full h-1 rounded bg-slate-100" />
                )}
              </div>
              <span className={`text-xs mt-2 ${isToday ? "font-bold text-indigo-600" : "text-slate-500"}`}>{isToday ? "Today" : weekday(d.date)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}