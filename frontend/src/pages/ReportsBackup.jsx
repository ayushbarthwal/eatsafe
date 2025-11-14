import { useEffect, useState } from "react";

// --- Sample Data for UI Preview ---
const SAMPLE_LOGS = [
  { Timestamp: "2025-11-14 10:00", Action: "Backup Created", User: "admin" },
  { Timestamp: "2025-11-13 09:30", Action: "Backup Restored", User: "ayush" },
  { Timestamp: "2025-11-12 08:15", Action: "Backup Deleted", User: "admin" },
];
const SAMPLE_HIGH_RISK = [
  { Food: "Spinach", Supplier: "GreenLeaf", CFU: 1500, Risk: "High Risk", Result: "Failed" },
  { Food: "Chicken", Supplier: "Meat Masters", CFU: 2000, Risk: "High Risk", Result: "Failed" },
];
// --- End Sample Data ---

export default function ReportsBackup() {
  const [logs, setLogs] = useState(SAMPLE_LOGS);
  const [highRisk, setHighRisk] = useState(SAMPLE_HIGH_RISK);
  const [generating, setGenerating] = useState(false);
  const [flyIn, setFlyIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFlyIn(true), 50);
    // Uncomment for real API
    /*
    fetch("http://localhost:5000/api/backup-auditlog")
      .then((res) => res.json())
      .then(setLogs);
    fetch("http://localhost:5000/api/full-quality-report?risk=High%20Risk")
      .then((res) => res.json())
      .then(setHighRisk);
    */
  }, [generating]);

  function generateBackup() {
    setGenerating(true);
    // Uncomment for real API
    /*
    fetch("http://localhost:5000/api/create-backup-snapshot", { method: "POST" })
      .then(() => setGenerating(false));
    */
    setTimeout(() => setGenerating(false), 1000); // Simulate
  }

  // Accent colors
  const accent = {
    blue: "#61dafb",
    pink: "#ff61e6",
    lime: "#a3e635",
    green: "#22c55e",
    red: "#ef4444",
    yellow: "#fbbf24",
    black: "#18122b",
    dark: "#23272f",
    gray: "#18181b",
    white: "#fff",
  };

  return (
    <div className={`max-w-6xl mx-auto py-6 px-2 flex flex-col items-center transition-all duration-700 ${
      flyIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`}>
      <h2 className="w-full text-2xl font-extrabold mb-10 text-white text-left">Reports & Backup</h2>
      <div className="w-full mb-8">
        <button
          className="w-full h-12 rounded-2xl font-bold text-lg shadow-lg border-2 flex items-center justify-center backdrop-blur-md"
          style={{
            background: "rgba(34,197,94,0.15)", // blurred green
            color: accent.green,
            borderColor: accent.green,
          }}
          onClick={generateBackup}
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate Backup"}
        </button>
      </div>
      <div className="w-full mb-8">
        <div className="font-bold mb-2 text-white text-left">Backup Audit Log</div>
        <div className="overflow-x-auto">
          <table
            className="min-w-full rounded-2xl overflow-hidden shadow-lg border-2 mb-4"
            style={{
              borderColor: accent.dark,
              background: accent.black,
              borderRadius: "1rem",
            }}
          >
            <thead>
              <tr style={{ background: accent.black }}>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Timestamp</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Action</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>User</th>
              </tr>
              <tr>
                <td colSpan={3}>
                  <div className="w-full border-b-4 border-white"></div>
                </td>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, idx) => (
                <tr
                  key={idx}
                  style={{
                    background: accent.black,
                    borderBottom: `2px solid ${accent.dark}`,
                  }}
                >
                  <td className="px-6 py-5 text-lg text-white">{l.Timestamp}</td>
                  <td className="px-6 py-5 text-lg text-white">{l.Action}</td>
                  <td className="px-6 py-5 text-lg text-white">{l.User}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-full">
        <div className="font-bold mb-2 text-white text-left">High Risk Products</div>
        <div className="overflow-x-auto">
          <table
            className="min-w-full rounded-2xl overflow-hidden shadow-lg border-2 mb-4"
            style={{
              borderColor: accent.dark,
              background: accent.black,
              borderRadius: "1rem",
            }}
          >
            <thead>
              <tr style={{ background: accent.black }}>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Food</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Supplier</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>CFU</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Risk</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Result</th>
              </tr>
              <tr>
                <td colSpan={5}>
                  <div className="w-full border-b-4 border-white"></div>
                </td>
              </tr>
            </thead>
            <tbody>
              {highRisk.map((r, idx) => (
                <tr
                  key={idx}
                  style={{
                    background: accent.black,
                    borderBottom: `2px solid ${accent.dark}`,
                  }}
                >
                  <td className="px-6 py-5 text-lg text-white">{r.Food}</td>
                  <td className="px-6 py-5 text-lg text-white">{r.Supplier}</td>
                  <td className="px-6 py-5 text-lg text-white">{r.CFU}</td>
                  <td className="px-6 py-5 text-lg font-bold text-red-500">{r.Risk}</td>
                  <td className="px-6 py-5 text-lg text-white">{r.Result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}