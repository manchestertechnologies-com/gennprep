import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoldNetwork from "../components/GoldNetwork";

// Landing page in the ManchesterTech style: black, gold, Poppins headings
const GOLD = "text-[#d4b26a]";
const btnGold = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#d4b26a] px-6 py-3.5 font-semibold !text-[#0a0a0a] shadow-[0_10px_40px_-12px_rgba(212,178,106,0.7)] transition hover:bg-[#e0c283]";
const btnDark = "inline-flex items-center justify-center gap-2 rounded-xl border border-[#3a3326] bg-[#0f0f0f]/60 px-6 py-3.5 font-semibold text-[#d4b26a] transition hover:border-[#d4b26a]/60";
const card = "rounded-2xl border border-[#262626] bg-linear-to-b from-[#171717] to-[#101010] transition hover:border-[#d4b26a]/50 hover:shadow-[0_0_40px_-10px_rgba(212,178,106,0.4)]";

const EXAMS = [
  { name: "NEET", tag: "Medical entrance", subjects: ["Physics", "Chemistry", "Biology"], count: "16,000+" },
  { name: "JEE", tag: "Engineering entrance", subjects: ["Physics", "Chemistry", "Maths"], count: "15,000+" },
  { name: "KCET", tag: "Karnataka CET", subjects: ["Physics", "Chemistry", "Maths", "Biology"], count: "34,000+" },
];

const FEATURES = [
  { title: "Chapter-wise practice", text: "Pick a chapter or concept and practise with instant answers and full solutions.", d: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { title: "Timed mock tests", text: "Real exam timing and marking, with auto-save and auto-submit.", d: "M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { title: "Rank and percentile", text: "See where you stand against other students after every mock test.", d: "M4 20V10M10 20V4M16 20v-6M2 20h20" },
  { title: "Revise your mistakes", text: "Every wrong answer is saved, so you fix weak spots before the exam.", d: "M4 4v6h6M20 20v-6h-6M19 9A8 8 0 005.6 6.6L4 10m16 4l-1.6 3.4A8 8 0 015 15" },
  { title: "Every question type", text: "MCQs, assertion-reason, match the following, statements and numericals.", d: "M4 6h16M4 12h16M4 18h10" },
  { title: "Progress and streaks", text: "Daily streaks, weekly charts and chapter accuracy keep you on track.", d: "M13 2L3 14h9l-1 8 10-12h-9z" },
];

const STEPS = [
  { title: "Create your free account", text: "Sign up in a minute and choose NEET, JEE or KCET." },
  { title: "Practise every day", text: "Short chapter sessions build accuracy and speed." },
  { title: "Test, rank, improve", text: "Take mocks, check your rank and revise what you got wrong." },
];

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function PreviewCard() {
  const options = ["5 m/s", "10 m/s", "20 m/s", "25 m/s"];
  return (
    <div className={card + " relative mx-auto w-full max-w-sm p-6 border-[#d4b26a]/40 shadow-[0_0_60px_-15px_rgba(212,178,106,0.45)]"}>
      <div className="flex items-center justify-between text-xs">
        <span className="rounded-lg bg-[#d4b26a]/12 px-2.5 py-1 font-semibold text-[#d4b26a]">Physics · Kinematics</span>
        <span className="font-mono text-[#9a9a9a]">12:45 left</span>
      </div>
      <p className="mt-5 text-[15px] font-medium leading-relaxed text-[#fafafa]">A car starts from rest and speeds up at 2 m/s² for 5 s. What is its final speed?</p>
      <div className="mt-5 space-y-2.5">
        {options.map((o, i) => (
          <div key={o} className={"flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm " + (i === 1 ? "border-[#d4b26a]/60 bg-[#d4b26a]/10 text-[#fafafa]" : "border-[#262626] text-[#b3b3b3]")}>
            <span className={"grid h-6 w-6 place-items-center rounded-full text-xs font-semibold " + (i === 1 ? "bg-[#d4b26a] text-[#0a0a0a]" : "border border-[#333]")}>{"ABCD"[i]}</span>
            {o}
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between rounded-xl border border-[#262626] bg-[#0f0f0f] px-3.5 py-2.5 text-xs">
        <span className="text-[#b3b3b3]">Correct · v = u + at</span>
        <span className="font-semibold text-[#57cc8f]">+4 marks</span>
      </div>
    </div>
  );
}

export default function Landing({ loggedIn }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />;
  if (user) return loggedIn;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e6e6e6]">
      <header className="sticky top-0 z-30 border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-9 w-9 rounded-lg" />
            <span className="font-display text-xl font-bold text-white">GenPrep</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {[["#exams", "Exams"], ["#features", "Features"], ["#how", "How it works"]].map(([href, label]) => (
              <a key={href} href={href} className="rounded-lg px-4 py-2 font-medium text-[#b3b3b3] transition hover:bg-[#d4b26a]/10 hover:text-[#d4b26a]">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-[#d1d1d1] hover:text-[#d4b26a]">Log in</Link>
            <Link to="/register" className={btnGold + " !px-4 !py-2.5 text-sm"}>Start free</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <GoldNetwork />
        <div className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#d4b26a]/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-20 text-center md:pt-28">
          <span className="inline-block rounded-full border border-[#d4b26a]/40 bg-[#d4b26a]/10 px-4 py-1.5 text-sm font-medium text-[#d4b26a]">Practise. Test. Rank.</span>
          <h1 className="font-display mx-auto mt-7 max-w-4xl text-4xl font-extrabold leading-[1.1] text-white sm:text-5xl md:text-6xl" style={{ textWrap: "balance" }}>
            Crack NEET, JEE and KCET with <span className={GOLD}>66,000+ real exam questions</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#9a9a9a]">
            Chapter-wise practice for Class 11 and 12, timed mock tests with rank, and a revision list built from your own mistakes.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className={btnGold}>Start practising free <span aria-hidden="true">→</span></Link>
            <Link to="/login" className={btnDark}>I have an account</Link>
          </div>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-[#9a9a9a]">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3fbf7f]" />NEET · JEE · KCET</span>
            <span className="hidden h-4 w-px bg-[#262626] sm:block" />
            <span>Class 11 and 12 syllabus</span>
            <span className="hidden h-4 w-px bg-[#262626] sm:block" />
            <span>Free to start</span>
          </div>
        </div>
      </section>

      {/* Exams */}
      <section id="exams" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#d4b26a]">Choose your exam</p>
        <h2 className="font-display mt-3 text-center text-3xl font-bold text-white md:text-4xl">Questions mapped to your syllabus</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {EXAMS.map((e) => (
            <div key={e.name} className={card + " p-7"}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-2xl font-extrabold text-white">{e.name}</span>
                <span className="font-display text-lg font-bold text-[#d4b26a]">{e.count}</span>
              </div>
              <p className="mt-1 text-sm text-[#9a9a9a]">{e.tag}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {e.subjects.map((s) => (
                  <span key={s} className="rounded-lg border border-[#262626] bg-[#0f0f0f] px-2.5 py-1 text-xs font-medium text-[#d1d1d1]">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features + preview */}
      <section id="features" className="scroll-mt-20 border-y border-[#1a1a1a] bg-[#0d0d0d] py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d4b26a]">Everything in one place</p>
            <h2 className="font-display mt-3 text-3xl font-bold text-white md:text-4xl">Built for serious preparation</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className={card + " p-5"}>
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d4b26a]/12 text-[#d4b26a]"><Icon d={f.d} /></div>
                  <h3 className="font-display mt-4 font-bold text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#9a9a9a]">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
          <PreviewCard />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#d4b26a]">How it works</p>
        <h2 className="font-display mt-3 text-center text-3xl font-bold text-white md:text-4xl">Three steps to a better score</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className={card + " p-6"}>
              <div className="font-display grid h-11 w-11 place-items-center rounded-full border border-[#d4b26a]/50 text-lg font-bold text-[#d4b26a]">{i + 1}</div>
              <h3 className="font-display mt-4 font-bold text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm text-[#9a9a9a]">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="px-4 pb-20">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#d4b26a]/30 bg-linear-to-b from-[#1a1712] to-[#0f0f0f] px-6 py-14 text-center shadow-[0_0_80px_-20px_rgba(212,178,106,0.45)]">
          <GoldNetwork className="opacity-60" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">Start your preparation <span className={GOLD}>today</span></h2>
            <p className="mt-3 text-[#9a9a9a]">It is free. All you need is an email address.</p>
            <Link to="/register" className={btnGold + " mt-8"}>Create free account <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1a1a1a] py-8 text-center text-sm text-[#737373]">
        © {new Date().getFullYear()} GenPrep · A <span className="text-[#d4b26a]">ManchesterTech</span> product
      </footer>
    </div>
  );
}