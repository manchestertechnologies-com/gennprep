const card = "bg-white rounded-xl border border-slate-200 p-5";

const formatTime = (sec) => {
  const m = Math.round((sec || 0) / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
};
const shortDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export function SummaryCards({ totals }) {
  const items = [
    { label: "Questions solved", value: totals.attempted, sub: `${totals.correct} correct` },
    { label: "Overall accuracy", value: `${totals.accuracy}%`, sub: "correct out of attempted" },
    { label: "Practice sessions", value: totals.practiceSessions, sub: `${formatTime(totals.timeSec)} spent` },
    { label: "Mock tests", value: totals.mocksTaken, sub: totals.bestRank ? `Best rank #${totals.bestRank}` : "No rank yet" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {items.map((it) => (
        <div key={it.label} className={card}>
          <p className="text-sm text-slate-500">{it.label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{it.value}</p>
          <p className="mt-1 text-xs text-slate-500">{it.sub}</p>
        </div>
      ))}
    </div>
  );
}

export function SubjectBars({ subjects }) {
  return (
    <div className={card}>
      <h2 className="font-semibold text-slate-900">Accuracy by subject</h2>
      {subjects.length === 0 && <p className="mt-3 text-sm text-slate-500">Practise a few questions to see this.</p>}
      <div className="mt-4 space-y-4">
        {subjects.map((s) => (
          <div key={s.id} title={`${s.name}: ${s.correct} of ${s.attempted} correct`}>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">{s.name}</span>
              <span className="font-semibold text-slate-900">{s.accuracy}%</span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-slate-100">
              <div className="h-2.5 rounded-full bg-indigo-500" style={{ width: `${Math.max(s.accuracy, 2)}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{s.correct} of {s.attempted} correct</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MockTrend({ mocks }) {
  const W = 560, H = 200, L = 36, R = 16, T = 12, B = 24;
  const x = (i) => (mocks.length === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (mocks.length - 1));
  const y = (v) => T + (1 - Math.min(Math.max(v, 0), 100) / 100) * (H - T - B);
  const line = mocks.map((m, i) => `${i ? "L" : "M"}${x(i)},${y(m.percentage)}`).join(" ");

  return (
    <div className={card}>
      <h2 className="font-semibold text-slate-900">Mock test scores (%)</h2>
      {mocks.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Take a mock test to see your score trend.</p>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label="Mock test scores over time">
            {[0, 50, 100].map((v) => (
              <g key={v}>
                <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeDasharray={v ? "4 4" : ""} />
                <text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#64748b">{v}</text>
              </g>
            ))}
            <path d={line} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
            {mocks.map((m, i) => (
              <g key={m.id}>
                <circle cx={x(i)} cy={y(m.percentage)} r="12" fill="transparent">
                  <title>{`${m.title}, ${shortDate(m.date)}: ${m.score}/${m.maxScore} (${m.percentage}%)`}</title>
                </circle>
                <circle cx={x(i)} cy={y(m.percentage)} r="4.5" fill="#6366f1" stroke="#fff" strokeWidth="2" pointerEvents="none" />
              </g>
            ))}
          </svg>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {mocks.slice(-3).reverse().map((m) => (
              <li key={m.id} className="flex justify-between gap-3 py-2">
                <span className="truncate text-slate-700">{m.title} <span className="text-slate-400">{shortDate(m.date)}</span></span>
                <span className="shrink-0 font-medium text-slate-900">
                  {m.score}/{m.maxScore}{m.rank ? ` - rank #${m.rank}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function DailyBars({ days }) {
  const max = Math.max(1, ...days.map((d) => d.attempted));
  const active = days.filter((d) => d.attempted > 0).length;
  return (
    <div className={card}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-slate-900">Questions per day (last 30 days)</h2>
        <span className="text-sm text-slate-500">{active} active days</span>
      </div>
      <div className="mt-4 flex h-32 items-end gap-[2px]">
        {days.map((d) => (
          <div key={d.date} className="group flex h-full flex-1 items-end" title={`${shortDate(d.date)}: ${d.attempted} questions, ${d.correct} correct`}>
            <div
              className={"w-full rounded-t " + (d.attempted ? "bg-indigo-500 group-hover:bg-indigo-700" : "bg-slate-100")}
              style={{ height: d.attempted ? `${Math.max((d.attempted / max) * 100, 4)}%` : "3px" }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{shortDate(days[0].date)}</span>
        <span>Today</span>
      </div>
    </div>
  );
}

const tone = (a) =>
  a >= 75 ? ["bg-emerald-50 text-emerald-700", "Strong"] : a >= 50 ? ["bg-amber-50 text-amber-700", "Improving"] : ["bg-red-50 text-red-700", "Weak"];

export function ChapterTable({ chapters }) {
  return (
    <div className={card}>
      <h2 className="font-semibold text-slate-900">Chapters (weakest first)</h2>
      {chapters.length === 0 && <p className="mt-3 text-sm text-slate-500">No chapters practised yet.</p>}
      {chapters.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-3 font-medium">Chapter</th>
                <th className="py-2 pr-3 font-medium">Subject</th>
                <th className="py-2 pr-3 text-right font-medium">Correct</th>
                <th className="py-2 text-right font-medium">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((c) => {
                const [cls, word] = tone(c.accuracy);
                return (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-slate-800">{c.name}</td>
                    <td className="py-2.5 pr-3 text-slate-500">{c.subject}</td>
                    <td className="py-2.5 pr-3 text-right text-slate-700">{c.correct}/{c.attempted}</td>
                    <td className="py-2.5 text-right">
                      <span className={"inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold " + cls}>
                        {c.accuracy}% {word}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}