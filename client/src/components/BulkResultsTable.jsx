// The list of rows in the bulk upload page, with Ready / problem for each
export default function BulkResultsTable({ rows, results, more }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-2 pr-3 font-medium">Row</th>
            <th className="py-2 pr-3 font-medium">Question</th>
            <th className="py-2 pr-3 font-medium">Chapter / Topic</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const res = results?.[r.rowNumber];
            return (
              <tr key={r.rowNumber} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-3 text-slate-500">{r.rowNumber}</td>
                <td className="py-2 pr-3 text-slate-800 max-w-md">{(r.question || "").slice(0, 120)}</td>
                <td className="py-2 pr-3 text-slate-500">{r.chapter} / {r.topic}</td>
                <td className="py-2">
                  {r.skip && <span className="text-red-700">Skipped: {r.skip}</span>}
                  {!res && !r.skip && <span className="text-slate-400">Not checked</span>}
                  {res?.ok && <span className="font-medium text-emerald-700">Ready{res.note ? <span className="block text-xs font-normal text-slate-500">{res.note}</span> : null}</span>}
                  {res && !res.ok && <span className="text-red-700">{res.error}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {more && <p className="mt-2 text-xs text-slate-500">Showing the first 500 rows.</p>}
    </div>
  );
}