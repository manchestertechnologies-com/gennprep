import { Link, useNavigate } from "react-router-dom";

// Shown when someone opens a link that doesn't exist
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-slate-900">
          <img src="/genprep-icon.png" alt="" className="h-8 w-8" />
          GenPrep
        </Link>
        <p className="mt-10 text-8xl font-extrabold tracking-tight bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">This page went missing</h1>
        <p className="mt-2 text-slate-500">The link may be old or mistyped. Let's get you back to your preparation.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            Go to home
          </Link>
          <button onClick={() => navigate(-1)} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}