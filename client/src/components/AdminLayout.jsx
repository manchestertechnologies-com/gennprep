import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
    { to: "/admin", label: "Overview", end: true },
    { to: "/admin/questions", label: "Questions" },
    { to: "/admin/syllabus", label: "Syllabus" },
    { to: "/admin/tests", label: "Mock tests" },
    { to: "/admin/students", label: "Students" },
];

export default function AdminLayout({ title, actions, children }) {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-slate-900 text-white">
                <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
                    <span className="font-bold">
                        ExamPrep AI
                        <span className="ml-2 text-xs font-medium bg-indigo-500 rounded px-1.5 py-0.5">Admin</span>
                    </span>

                    <nav className="flex flex-wrap gap-1">
                        {LINKS.map((l) => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                end={l.end}
                                className={({ isActive }) =>
                                    `px-3 py-1.5 rounded-md text-sm ${isActive ? "bg-white/15 text-white" : "text-slate-300 hover:text-white"}`
                                }
                            >
                                {l.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-3 text-sm">
                        <Link to="/dashboard" className="text-slate-300 hover:text-white">
                            Student view
                        </Link>
                        <span className="text-slate-400">{user.name}</span>
                        <button onClick={logout} className="rounded-md border border-slate-600 px-3 py-1 text-slate-200 hover:bg-white/10">
                            Log out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    {actions}
                </div>
                {children}
            </main>
        </div>
    );
}