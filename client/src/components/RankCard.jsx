import { Link } from "react-router-dom";

// Shown at the top of a mock test result: title, rank and percentile
export default function RankCard({ data }) {
    if (data.mode !== "mock") return null;
    const rank = data.rank;

    return (
        <section className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-5">
            <p className="text-sm font-medium text-indigo-700">{data.testTitle}</p>

            {data.status === "auto_submitted" && (
                <p className="text-xs text-amber-700 mt-1">
                    Time ran out, so your saved answers were submitted automatically.
                </p>
            )}

            {rank && (
                <div className="flex flex-wrap gap-8 mt-3">
                    <div>
                        <p className="text-xs text-slate-500">Rank</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {rank.rank} <span className="text-base font-normal text-slate-500">of {rank.totalCandidates}</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Percentile</p>
                        <p className="text-2xl font-bold text-slate-900">{rank.percentile}</p>
                    </div>
                </div>
            )}

            <p className="text-xs text-slate-500 mt-3">Your rank updates as more students take this test.</p>
            <Link to="/mock-tests" className="inline-block mt-2 text-sm font-medium text-indigo-700 hover:underline">
                Back to mock tests
            </Link>
        </section>
    );
}