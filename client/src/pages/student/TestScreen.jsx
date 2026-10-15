import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import QuestionView from "../../components/QuestionView";
import QuestionPalette from "../../components/QuestionPalette";
import TestHeader from "../../components/TestHeader";
import TestActionBar from "../../components/TestActionBar";
import SubmitSummary from "../../components/SubmitSummary";
import { countStatuses } from "../../components/testStatus";
import useTestSession, { formatClock } from "../../hooks/useTestSession";

export default function TestScreen() {
  const { id } = useParams();
  const {
    info, questions, current, answers, setAnswers, marked, setMarked, visited, error, loading, submitting,
    summaryOpen, setSummaryOpen, saveState, isMock, remaining, openedAt, now, goTo, chooseOption, submit,
  } = useTestSession(id);

  const question = questions[current];

  // 6. Keyboard: 1-4 or A-D choose an option, arrow keys move between questions
  useEffect(() => {
    const onKey = (e) => {
      if (!question || summaryOpen || e.ctrlKey || e.metaKey || e.altKey) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      const pos = "1234".includes(k) && k.length === 1 ? Number(k) - 1 : "abcd".indexOf(k);
      if (k.length === 1 && pos >= 0 && question.options[pos]) chooseOption(question, question.options[pos].id);
      else if (e.key === "ArrowRight") goTo(current + 1);
      else if (e.key === "ArrowLeft") goTo(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading questions...</div>;
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center max-w-md">
          <p className="text-slate-700">{error || "No questions found for this attempt."}</p>
          <Link to="/dashboard" className="inline-block mt-4 text-indigo-600 font-medium hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isLast = current === questions.length - 1;
  const counts = countStatuses(questions, answers, marked, visited);
  const saveNext = () => (isLast ? setSummaryOpen(true) : goTo(current + 1));

  return (
    <div className="min-h-screen bg-slate-50">
      <TestHeader
        title={info.title}
        isMock={isMock}
        saveState={saveState}
        clockText={formatClock(remaining !== null ? remaining : Math.floor((now - openedAt) / 1000))}
        remaining={remaining}
        answered={counts.answered + counts.answeredMarked}
        total={questions.length}
        submitting={submitting}
        onSubmit={() => setSummaryOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 pt-6 pb-28 grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}
          <QuestionView
            question={question}
            index={current}
            total={questions.length}
            selected={answers[question._id] || []}
            isMarked={Boolean(marked[question._id])}
            markingScheme={info.markingScheme}
            onChoose={(optionId) => chooseOption(question, optionId)}
            onNumber={(text) => setAnswers((prev) => ({ ...prev, [question._id]: text.trim() ? [text] : [] }))}
          />
        </div>
        <QuestionPalette questions={questions} current={current} answers={answers} marked={marked} visited={visited} onJump={goTo} />
      </main>

      <TestActionBar
        isFirst={current === 0}
        isLast={isLast}
        hasAnswer={(answers[question._id] || []).length > 0}
        isMarked={Boolean(marked[question._id])}
        onPrev={() => goTo(current - 1)}
        onClear={() => setAnswers((prev) => ({ ...prev, [question._id]: [] }))}
        onMark={() => {
          if (marked[question._id]) setMarked((prev) => ({ ...prev, [question._id]: false }));
          else {
            setMarked((prev) => ({ ...prev, [question._id]: true }));
            if (!isLast) goTo(current + 1);
          }
        }}
        onSaveNext={saveNext}
      />

      {summaryOpen && (
        <SubmitSummary
          counts={counts}
          total={questions.length}
          submitting={submitting}
          onCancel={() => !submitting && setSummaryOpen(false)}
          onConfirm={submit}
        />
      )}
    </div>
  );
}