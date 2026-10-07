import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";
import { downloadTemplate, readSheet } from "../../utils/bulkSheet";
import BulkResultsTable from "../../components/BulkResultsTable";

const CHUNK = 100; // rows sent to the server at a time
const MAX_ROWS = 2000;
const box = "bg-white rounded-xl border border-slate-200 p-5";
const btn = "rounded-lg text-sm font-medium px-4 py-2 disabled:opacity-50";

export default function BulkUpload() {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState("");
  const [publish, setPublish] = useState(true);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [results, setResults] = useState(null); // rowNumber -> { ok, error }
  const [added, setAdded] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [onlyProblems, setOnlyProblems] = useState(false);

  useEffect(() => {
    api
      .get("/exams")
      .then((res) => {
        setExams(res.data.exams);
        if (res.data.exams[0]) setExamId(res.data.exams[0]._id);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const exam = exams.find((e) => e._id === examId);
  const clearResults = () => {
    setResults(null);
    setAdded(null);
    setError("");
  };

  const getTemplate = async () => {
    clearResults();
    setBusy("Preparing the template...");
    try {
      const res = await api.get("/admin/questions/bulk/syllabus", { params: { examId } });
      await downloadTemplate(exam?.code, res.data.rows);
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setBusy("");
  };

  const pickFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    clearResults();
    setRows([]);
    setFileName(file.name);
    setBusy("Reading the file...");
    try {
      const list = await readSheet(file);
      if (list.length === 0) setError("No questions found. The first row must have the column names from the template.");
      else if (list.length > MAX_ROWS) setError(`This file has ${list.length} rows. Please upload at most ${MAX_ROWS} at a time.`);
      else setRows(list);
    } catch {
      setError("Could not read this file. Please use the Excel template or a CSV file.");
    }
    setBusy("");
  };

  // dryRun = only check; otherwise add the good rows. Sent in parts of 100.
  const send = async (dryRun) => {
    clearResults();
    const map = {};
    let total = 0;
    try {
      for (let i = 0; i < rows.length; i += CHUNK) {
        setBusy(`${dryRun ? "Checking" : "Importing"} rows ${i + 1}-${Math.min(i + CHUNK, rows.length)} of ${rows.length}...`);
        const res = await api.post("/admin/questions/bulk", {
          examId,
          dryRun,
          status: publish ? "published" : "draft",
          rows: rows.slice(i, i + CHUNK),
        });
        res.data.results.forEach((r) => (map[r.rowNumber] = r));
        total += res.data.added;
      }
      setResults(map);
      if (!dryRun) setAdded(total);
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setBusy("");
  };

  const good = results ? rows.filter((r) => results[r.rowNumber]?.ok).length : 0;
  const shown = rows.filter((r) => !onlyProblems || (results && !results[r.rowNumber]?.ok)).slice(0, 500);

  return (
    <AdminLayout
      title="Bulk upload"
      actions={<Link to="/admin/questions" className="text-sm font-medium text-indigo-600 hover:underline">Back to questions</Link>}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div className={box}>
          <h2 className="font-semibold text-slate-900">1. Get the template</h2>
          <p className="mt-1 text-sm text-slate-500">It includes example rows and a Syllabus sheet with every chapter and topic name.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select value={examId} onChange={(e) => { setExamId(e.target.value); clearResults(); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {exams.map((e) => <option key={e._id} value={e._id}>{e.code}</option>)}
            </select>
            <button onClick={getTemplate} disabled={!examId || !!busy} className={btn + " border border-indigo-200 text-indigo-700 hover:bg-indigo-50"}>
              Download template
            </button>
          </div>
        </div>

        <div className={box}>
          <h2 className="font-semibold text-slate-900">2. Upload your filled file</h2>
          <p className="mt-1 text-sm text-slate-500">Excel (.xlsx) or CSV. Up to {MAX_ROWS} questions at a time.</p>
          <label className="mt-4 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-4 py-4 text-sm text-slate-600 hover:border-indigo-400 hover:bg-indigo-50">
            <input type="file" accept=".xlsx,.xls,.csv" onChange={pickFile} className="hidden" />
            {fileName ? <span><b>{fileName}</b> - {rows.length} questions found. Click to choose another.</span> : "Click to choose a file"}
          </label>
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
            Publish right away (untick to save as drafts)
          </label>
        </div>
      </div>

      {error && <div className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}
      {busy && <div className="mt-4 rounded-lg bg-indigo-50 text-indigo-700 text-sm px-4 py-3">{busy}</div>}
      {added !== null && (
        <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-800 text-sm px-4 py-3">
          Done! <b>{added}</b> questions added{rows.length - added > 0 ? `, ${rows.length - added} skipped (see the reasons below)` : ""}.{" "}
          <Link to="/admin/questions" className="font-semibold underline">View questions</Link>
        </div>
      )}

      {rows.length > 0 && (
        <div className={box + " mt-4"}>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => send(true)} disabled={!!busy} className={btn + " border border-slate-300 text-slate-700 hover:bg-slate-50"}>
              3. Check file
            </button>
            {results && added === null && (
              <button onClick={() => send(false)} disabled={!!busy || good === 0} className={btn + " bg-indigo-600 text-white hover:bg-indigo-700"}>
                4. Import {good} good questions
              </button>
            )}
            {results && (
              <span className="text-sm text-slate-600">
                <b className="text-emerald-700">{good} ready</b>, <b className="text-red-700">{rows.length - good} with problems</b>
              </span>
            )}
            {results && (
              <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={onlyProblems} onChange={(e) => setOnlyProblems(e.target.checked)} /> Only problems
              </label>
            )}
          </div>

          <BulkResultsTable rows={shown} results={results} more={rows.length > shown.length && !onlyProblems} />
        </div>
      )}
    </AdminLayout>
  );
}