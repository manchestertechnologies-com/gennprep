import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EXAMS, FEATURES, STEPS, Icon, PreviewCard } from "../components/LandingParts";

export default function Landing({ loggedIn }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-white" />;
  if (user) return loggedIn;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            ExamPrep AI
          </Link>
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            <Link to="/login" className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100">Log in</Link>
            <Link to="/register" className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">Sign up free</Link>
          </nav>
        </div>
      </header>

      <section className="bg-linear-to-b from-indigo-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-100">For NEET, JEE and KCET aspirants</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">Practise smarter. <span className="text-indigo-600">Score higher.</span></h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">Chapter-wise practice, timed mock tests with rank, and a revision list built from your own mistakes. Everything you need, in one place.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="rounded-xl bg-indigo-600 px-6 py-3 text-center font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700">Start practising free</Link>
              <Link to="/login" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50">I have an account</Link>
            </div>
          </div>
          <PreviewCard />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Choose your exam</h2>
        <p className="mt-2 text-center text-slate-600">Syllabus-mapped questions for each exam.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {EXAMS.map((e) => (
            <div key={e.name} className="rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <span className={"inline-block rounded-lg px-3 py-1 text-lg font-extrabold " + e.color}>{e.name}</span>
              <p className="mt-4 font-semibold">{e.tag}</p>
              <p className="mt-1 text-sm text-slate-500">{e.subjects}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Everything you need to prepare</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon d={f.d} /></div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-indigo-600 text-lg font-bold text-white">{i + 1}</div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-indigo-600 px-6 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">Start your preparation today</h2>
          <p className="mt-3 text-indigo-100">It is free. All you need is an email address.</p>
          <Link to="/register" className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50">Create free account</Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} ExamPrep AI. Built for NEET, JEE and KCET students.
      </footer>
    </div>
  );
}