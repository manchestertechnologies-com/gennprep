import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useExam } from "../../context/ExamContext";

// Remembers (on this device) that this user already picked an exam
export const choiceKey = (user) => "examChosen:" + (user?._id || user?.id || user?.email || "me");

const INFO = {
  NEET: { tag: "Medical entrance", subjects: "Physics, Chemistry, Biology", color: "bg-emerald-100 text-emerald-700" },
  JEE: { tag: "Engineering entrance", subjects: "Physics, Chemistry, Maths", color: "bg-sky-100 text-sky-700" },
  KCET: { tag: "Karnataka CET", subjects: "Physics, Chemistry, Maths, Biology", color: "bg-amber-100 text-amber-700" },
};

export default function Welcome() {
  const { user } = useAuth();
  const { exams, setExamId } = useExam();
  const navigate = useNavigate();

  const finish = (id) => {
    if (id) setExamId(id);
    localStorage.setItem(choiceKey(user), "1");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl text-center">
        <img src="/genprep-icon.png" alt="" className="mx-auto h-12 w-12" />
        <h1 className="mt-6 text-3xl font-extrabold text-slate-900">Hi {user?.name?.split(" ")[0]}, welcome to GenPrep</h1>
        <p className="mt-2 text-slate-600">Which exam are you preparing for? You can change it any time from the top bar.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {exams.length === 0 &&
            [0, 1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-200" />)}
          {exams.map((e) => {
            const info = INFO[e.code] || {};
            return (
              <button
                key={e._id}
                onClick={() => finish(e._id)}
                className="group rounded-2xl border-2 border-slate-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-indigo-500 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-200"
              >
                <span className={"inline-block rounded-lg px-3 py-1 text-lg font-extrabold " + (info.color || "bg-indigo-100 text-indigo-700")}>
                  {e.code}
                </span>
                <p className="mt-4 font-semibold text-slate-900">{info.tag || e.name}</p>
                {info.subjects && <p className="mt-1 text-sm text-slate-500">{info.subjects}</p>}
                <p className="mt-4 text-sm font-semibold text-indigo-600 group-hover:underline">Choose {e.code} &rarr;</p>
              </button>
            );
          })}
        </div>

        <button onClick={() => finish(null)} className="mt-8 text-sm text-slate-500 hover:text-slate-700 underline">
          Skip for now
        </button>
      </div>
    </div>
  );
}