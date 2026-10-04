import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../api/axios";

export default function Login() {
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Already logged in? Go straight to the dashboard
    if (user) return <Navigate to="/" replace />;

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault(); // stop the browser from reloading the page
        setError("");
        setSubmitting(true);
        try {
            await login(form.email, form.password);
            navigate("/");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
                <p className="text-slate-500 mt-1">Log in to continue your preparation</p>

                {error && (
                    <div className="mt-5 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                            Email
                        </label>
                        <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className={inputClass} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                            Password
                        </label>
                        <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} className={inputClass} />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-indigo-600 text-white font-medium py-2.5 hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {submitting ? "Logging in..." : "Log in"}
                    </button>
                </form>

                <p className="text-sm text-slate-600 mt-6 text-center">
                    New here?{" "}
                    <Link to="/register" className="text-indigo-600 font-medium hover:underline">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}