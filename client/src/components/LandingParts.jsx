export const EXAMS = [
  { name: "NEET", tag: "Medical entrance", subjects: "Physics, Chemistry, Biology", color: "bg-emerald-100 text-emerald-700" },
  { name: "JEE", tag: "Engineering entrance", subjects: "Physics, Chemistry, Maths", color: "bg-sky-100 text-sky-700" },
  { name: "KCET", tag: "Karnataka CET", subjects: "Physics, Chemistry, Maths, Biology", color: "bg-amber-100 text-amber-700" },
];

export const FEATURES = [
  { title: "Chapter-wise practice", text: "Pick a chapter or topic and practise with instant answers and clear explanations.", d: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { title: "Timed mock tests", text: "Full-length tests with a real exam timer, auto-save and auto-submit.", d: "M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { title: "Rank and percentile", text: "See where you stand against other students after every mock test.", d: "M4 20V10M10 20V4M16 20v-6M2 20h20" },
  { title: "Revise your mistakes", text: "Every wrong answer is saved so you can fix weak spots before the exam.", d: "M4 4v6h6M20 20v-6h-6M19 9A8 8 0 005.6 6.6L4 10m16 4l-1.6 3.4A8 8 0 015 15" },
  { title: "Bookmarks", text: "Save tricky questions and come back to them any time.", d: "M6 3h12v18l-6-4-6 4z" },
  { title: "Progress and streaks", text: "Daily streaks, weekly charts and chapter accuracy keep you on track.", d: "M13 2L3 14h9l-1 8 10-12h-9z" },
];

export const STEPS = [
  { title: "Create your free account", text: "Sign up in under a minute and choose NEET, JEE or KCET." },
  { title: "Practise every day", text: "Short chapter sessions build your accuracy and speed." },
  { title: "Test and improve", text: "Take mock tests, check your rank and revise what you got wrong." },
];

export function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function PreviewCard() {
  const options = ["5 m/s", "10 m/s", "20 m/s", "25 m/s"];
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rounded-3xl bg-indigo-200/40 blur-2xl" />
      <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between text-xs">
          <span className="rounded-full bg-indigo-50 px-2 py-1 font-semibold text-indigo-700">Physics, Kinematics</span>
          <span className="font-mono text-slate-500">12:45 left</span>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-800">A car starts from rest and speeds up at 2 m/s every second for 5 s. What is its final speed?</p>
        <div className="mt-4 space-y-2">
          {options.map((o, i) => (
            <div key={o} className={"flex items-center gap-3 rounded-lg border px-3 py-2 text-sm " + (i === 1 ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-600")}>
              <span className="grid h-6 w-6 place-items-center rounded-full border text-xs font-semibold">{"ABCD"[i]}</span>
              {o}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span>Correct! v = u + at</span>
          <span className="font-semibold text-emerald-600">+4 marks</span>
        </div>
      </div>
    </div>
  );
}