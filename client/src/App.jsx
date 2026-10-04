import { useEffect, useState } from "react";

export default function App() {
  // "checking" -> "ok" or "error"
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");

  // Runs once when the page opens: asks the backend if it's alive
  useEffect(() => {
    fetch("/api/health")
      .then((res) => {
        if (!res.ok) throw new Error(`Server replied with status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setStatus("ok");
        setMessage(data.message);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error.message);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-slate-900">ExamPrep AI</h1>
        <p className="text-slate-500 mt-1">NEET · JEE · KCET</p>

        <div
          className={`mt-6 rounded-xl px-4 py-3 text-sm font-medium ${status === "ok"
              ? "bg-green-50 text-green-700"
              : status === "error"
                ? "bg-red-50 text-red-700"
                : "bg-slate-100 text-slate-600"
            }`}
        >
          {status === "checking" && "Checking the backend..."}
          {status === "ok" && `Backend connected: ${message}`}
          {status === "error" && `Backend not reachable: ${message}`}
        </div>
      </div>
    </div>
  );
}