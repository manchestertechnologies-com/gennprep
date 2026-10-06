import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ExamProvider, useExam } from "../context/ExamContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10" },
  { to: "/practice", label: "Practice", icon: "M5 4h11l3 3v13H5zM9 10h6M9 14h6" },
  { to: "/mock-tests", label: "Mock tests", icon: "M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z" },
  { to: "/revise", label: "Revise", icon: "M4 4v6h6M20 20v-6h-6M5.5 15a7.5 7.5 0 0013.5 2M18.5 9A7.5 7.5 0 005 7" },
];

function Icon({ path }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function ExamPicker() {
  const { exams, examId, setExamId } = useExam();
  if (exams.length === 0) return null;
  return (
    <select
      value={examId}
      onChange={(e) => setExamId(e.target.value)}
      aria-label="Exam"
      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-semibold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {exams.map((e) => (
        <option key={e._id} value={e._id}>
          {e.code}
        </option>
      ))}
    </select>
  );
}

function Shell() {
  const { user, logout } = useAuth();
  const { examId } = useExam();

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium ${
      isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;
  const tabClass = ({ isActive }) =>
    `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium ${isActive ? "text-indigo-700" : "text-slate-500"}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
            <img src="/favicon.svg" alt="" className="w-7 h-7" />
            <span>ExamPrep AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Main">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            {user.role === "admin" && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <ExamPicker />
            <span className="hidden sm:block text-sm text-slate-500 max-w-32 truncate">{user.name}</span>
            <button
              onClick={logout}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="pb-20 md:pb-0">
        {/* key: when the exam changes, the page reloads its data for the new exam */}
        <Outlet key={examId} />
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-200 flex" aria-label="Main">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} className={tabClass}>
            <Icon path={l.icon} />
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default function StudentLayout() {
  return (
    <ExamProvider>
      <Shell />
    </ExamProvider>
  );
}