// The grid of question numbers on the right side of the test screen
export default function QuestionPalette({ questions, current, answers, marked, showMarked, onJump }) {
    const isAnswered = (q) => (answers[q._id] || []).length > 0;
    const answeredCount = questions.filter(isAnswered).length;
    const markedCount = questions.filter((q) => marked[q._id]).length;

    const colorFor = (q) => {
        if (showMarked && marked[q._id]) return "bg-purple-500 text-white";
        if (isAnswered(q)) return "bg-green-500 text-white";
        return "bg-slate-100 text-slate-700";
    };

    return (
        <aside className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
            <h2 className="font-semibold text-slate-900">Questions</h2>
            <p className="text-xs text-slate-500 mt-1">
                {answeredCount} answered · {questions.length - answeredCount} left
                {showMarked ? ` · ${markedCount} marked` : ""}
            </p>

            <div className="grid grid-cols-5 gap-2 mt-4">
                {questions.map((q, index) => (
                    <button
                        key={q._id}
                        onClick={() => onJump(index)}
                        className={`relative h-9 rounded-lg text-sm font-medium ${colorFor(q)} ${index === current ? "ring-2 ring-indigo-500 ring-offset-1" : ""
                            }`}
                    >
                        {index + 1}
                        {showMarked && marked[q._id] && isAnswered(q) && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border border-white" />
                        )}
                    </button>
                ))}
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-green-500" /> Answered
                </p>
                {showMarked && (
                    <p className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-purple-500" /> Marked for review
                    </p>
                )}
                <p className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" /> Not answered
                </p>
                {showMarked && (
                    <p className="pt-1">A green dot means the marked question has an answer, and it will still be scored.</p>
                )}
            </div>
        </aside>
    );
}