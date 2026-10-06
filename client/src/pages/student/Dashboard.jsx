import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useExam } from "../../context/ExamContext";
import { ChapterList, RecentTests, RecommendedCard, StatsRow, WeeklyChart } from "../../components/DashboardWidgets";

export default function Dashboard() {
  const { user } = useAuth();
  const { examId, exam } = useExam();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // The page reloads by itself when the exam changes (see StudentLayout)
  useEffect(() => {
    if (!examId) return;
    api
      .get("/progress/dashboard", { params: { examId } })
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, [examId]);

  const examCode = exam?.code || "";
  const hasActivity = data && data.totals.attempted > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.name}</h1>
          <p className="text-slate-500 mt-1">Your {examCode} preparation at a glance</p>
        </div>
        <Link to="/practice" className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 hover:bg-indigo-700">
          Start practice
        </Link>
      </div>

      {error && <div className="mt-6 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      {!data && !error && (
        <div className="mt-6 rounded-xl bg-white border border-slate-200 p-6 text-slate-500">Loading your progress...</div>
      )}

      {data && <StatsRow totals={data.totals} streak={data.streak} />}

      {data && !hasActivity && (
        <div className="mt-6 rounded-xl bg-white border border-slate-200 p-8 text-center">
          <p className="font-semibold text-slate-900">No practice yet for {examCode}</p>
          <p className="text-slate-500 mt-1 text-sm">Your charts and weak chapters will appear here after your first practice session.</p>
        </div>
      )}

      {hasActivity && (
        <div>
          <div className="grid lg:grid-cols-3 gap-4 mt-4">
            <div className="lg:col-span-2">
              <WeeklyChart days={data.last7Days} />
            </div>
            <RecommendedCard recommended={data.recommended} wrongCount={data.wrongQuestionsCount} />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <ChapterList title="Weak chapters" chapters={data.weakChapters} emptyText="No weak chapters yet." tone="weak" />
            <ChapterList
              title="Strong chapters"
              chapters={data.strongChapters}
              emptyText="Reach 80% accuracy in a chapter to see it here."
              tone="strong"
            />
          </div>
          <RecentTests tests={data.recentTests} />
        </div>
      )}
    </div>
  );
}