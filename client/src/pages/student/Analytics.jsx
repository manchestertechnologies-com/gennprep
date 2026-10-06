import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import { useExam } from "../../context/ExamContext";
import { Bone } from "../../components/Skeleton";
import { ChapterTable, DailyBars, MockTrend, SubjectBars, SummaryCards } from "../../components/AnalyticsCharts";

export default function Analytics() {
  const { examId, exam } = useExam();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!examId) return;
    api
      .get("/progress/analytics", { params: { examId } })
      .then((res) => setData(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, [examId]);

  const empty = data && data.totals.attempted === 0 && data.mocks.length === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
      <p className="text-slate-500 mt-1">How your {exam?.code || ""} preparation is going</p>

      {error && <div className="mt-6 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      {!data && !error && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => <Bone key={i} className="h-24" />)}
          </div>
          <Bone className="h-64" />
        </div>
      )}

      {empty && (
        <div className="mt-6 rounded-xl bg-white border border-slate-200 p-8 text-center">
          <p className="font-semibold text-slate-900">No data yet for {exam?.code}</p>
          <p className="text-slate-500 mt-1 text-sm">Finish a practice session or a mock test and your charts will appear here.</p>
          <Link to="/practice" className="mt-4 inline-block rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 hover:bg-indigo-700">
            Start practice
          </Link>
        </div>
      )}

      {data && !empty && (
        <>
          <SummaryCards totals={data.totals} />
          <div className="grid lg:grid-cols-2 gap-4 mt-4">
            <SubjectBars subjects={data.subjects} />
            <MockTrend mocks={data.mocks} />
          </div>
          <div className="mt-4">
            <DailyBars days={data.daily} />
          </div>
          <div className="mt-4">
            <ChapterTable chapters={data.chapters} />
          </div>
        </>
      )}
    </div>
  );
}