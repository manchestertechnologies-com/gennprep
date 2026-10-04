const DIFFICULTY_STYLES = {
    easy: "bg-green-50 text-green-700",
    medium: "bg-amber-50 text-amber-700",
    hard: "bg-red-50 text-red-700",
};

// One question with its options and the navigation buttons
export default function QuestionView({
    question,
    index,
    total,
    selected,
    isMarked,
    markingScheme,
    isMock,
    submitting,
    onChoose,
    onClear,
    onToggleMark,
    onPrev,
    onNext,
    onSubmit,
}) {
    const isLast = index === total - 1;

    return (
        <section className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-slate-900">
                    Question {index + 1} of {total}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${DIFFICULTY_STYLES[question.difficulty] || ""}`}>
                    {question.difficulty}
                </span>
                {markingScheme && (
                    <span className="text-xs text-slate-500">
                        +{markingScheme.correct} correct, {markingScheme.incorrect} wrong
                    </span>
                )}
                {isMarked && (
                    <span className="ml-auto px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                        Marked for review
                    </span>
                )}
            </div>

            {question.type === "mcq_multi" && (
                <p className="text-xs text-indigo-700 mt-2">More than one answer can be correct.</p>
            )}

            <p className="text-lg text-slate-900 mt-4 whitespace-pre-line">{question.text}</p>

            {question.images?.map((img) => (
                <img key={img.url} src={img.url} alt={img.alt || "Question diagram"} className="mt-4 max-h-72 rounded-lg border border-slate-200" />
            ))}

            <div className="mt-6 space-y-3">
                {question.options.map((opt) => {
                    const isSelected = selected.includes(opt.id);
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onChoose(opt.id)}
                            className={`w-full text-left flex items-start gap-3 rounded-xl border px-4 py-3 ${isSelected ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:border-slate-400"
                                }`}
                        >
                            <span
                                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                                    }`}
                            >
                                {opt.id}
                            </span>
                            <span className="text-slate-800 pt-0.5">
                                {opt.text}
                                {opt.image?.url && <img src={opt.image.url} alt={`Option ${opt.id}`} className="mt-2 max-h-40 rounded" />}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
                <button
                    onClick={onPrev}
                    disabled={index === 0}
                    className="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2 disabled:opacity-40"
                >
                    ← Previous
                </button>
                <button
                    onClick={onClear}
                    disabled={selected.length === 0}
                    className="text-sm text-slate-500 hover:text-slate-800 px-2 disabled:opacity-40"
                >
                    Clear answer
                </button>
                {isMock && (
                    <button
                        onClick={onToggleMark}
                        className={`rounded-lg border text-sm font-medium px-4 py-2 ${isMarked ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-300 text-slate-700"
                            }`}
                    >
                        {isMarked ? "Unmark review" : "Mark for review"}
                    </button>
                )}
                <div className="ml-auto">
                    {isLast ? (
                        <button
                            onClick={onSubmit}
                            disabled={submitting}
                            className="rounded-lg bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:bg-indigo-700 disabled:opacity-60"
                        >
                            Submit
                        </button>
                    ) : (
                        <button onClick={onNext} className="rounded-lg bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-700">
                            Next →
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}