import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">ExamPrep AI</span>
                    <button
                        onClick={logout}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5"
                    >
                        Log out
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
                <p className="text-slate-500 mt-1">
                    Logged in as {user.email} ({user.role})
                </p>
                <div className="mt-6 rounded-xl bg-white border border-slate-200 p-6 text-slate-600">
                    Your dashboard with progress, streak and weak chapters is coming in the next step.
                </div>
            </main>
        </div>
    );
}