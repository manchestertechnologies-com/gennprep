// Four option boxes, each with a "Correct" tick (radio for one answer, checkbox for several)
export default function OptionsEditor({ options, correct, multi, onChangeText, onToggleCorrect }) {
    return (
        <div className="space-y-2">
            {options.map((opt) => {
                const isCorrect = correct.includes(opt.id);
                return (
                    <div
                        key={opt.id}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${isCorrect ? "border-green-500 bg-green-50" : "border-slate-200"
                            }`}
                    >
                        <span className="font-semibold text-slate-700 w-5">{opt.id}</span>
                        <input
                            value={opt.text}
                            onChange={(e) => onChangeText(opt.id, e.target.value)}
                            placeholder={`Option ${opt.id}`}
                            className="flex-1 bg-transparent text-sm focus:outline-none"
                        />
                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
                            <input
                                type={multi ? "checkbox" : "radio"}
                                name="correct-option"
                                checked={isCorrect}
                                onChange={() => onToggleCorrect(opt.id)}
                            />
                            Correct
                        </label>
                    </div>
                );
            })}
        </div>
    );
}