import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

// --- Sample Data for UI Preview ---
const SAMPLE_TESTS = [
  { TestID: 1, pH: 6.5, Moisture: "12%", Result: "Passed", Notes: "Normal" },
  { TestID: 2, pH: 5.2, Moisture: "18%", Result: "Failed", Notes: "High moisture" },
  { TestID: 3, pH: 7.1, Moisture: "10%", Result: "Passed", Notes: "Optimal" },
];
// --- End Sample Data ---

export default function QualityTests() {
  const [tests, setTests] = useState(SAMPLE_TESTS);
  const [running, setRunning] = useState(false);
  const [flyIn, setFlyIn] = useState(false);
  const [newTestId, setNewTestId] = useState(null);

  useEffect(() => {
    setTimeout(() => setFlyIn(true), 50);
    // Uncomment for real API
    /*
    fetch("http://localhost:5000/api/quality-tests")
      .then((res) => res.json())
      .then(setTests);
    */
  }, [running]);

  function runAutomatedTest() {
    setRunning(true);
    // Uncomment for real API
    /*
    fetch("http://localhost:5000/api/run-quality-and-prediction", { method: "POST" })
      .then(() => setRunning(false));
    */
    setTimeout(() => setRunning(false), 1000); // Simulate running
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
      <h2 className="w-full text-2xl font-extrabold mb-10 text-white text-left">Quality Tests</h2>
      <div className="w-full mb-8">
        <button
          className="w-full h-12 rounded-2xl font-bold text-lg shadow-lg border-2 flex items-center justify-center backdrop-blur-md"
          style={{
            background: "rgba(34,197,94,0.15)", // green with blur
            color: accent.green,
            borderColor: accent.green,
          }}
          onClick={runAutomatedTest}
          disabled={running}
        >
          {running ? "Running..." : "Run Automated Test"}
        </button>
      </div>
      <div className="w-full">
        <div className="overflow-x-auto">
          <table
            className="min-w-full rounded-2xl overflow-hidden shadow-lg border-2"
            style={{
              borderColor: accent.dark,
              background: accent.black,
              borderRadius: "1rem",
            }}
          >
            <thead>
              <tr style={{ background: accent.black }}>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Test ID</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>pH</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Moisture</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Result</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Notes</th>
              </tr>
              <tr>
                <td colSpan={5}>
                  <div className="w-full border-b-4 border-white"></div>
                </td>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr
                  key={t.TestID}
                  style={{
                    background: accent.black,
                    borderBottom: `2px solid ${accent.dark}`,
                  }}
                >
                  <td className="px-6 py-5 text-lg text-white">{t.TestID}</td>
                  <td className="px-6 py-5 text-lg text-white">{t.pH}</td>
                  <td className="px-6 py-5 text-lg text-white">{t.Moisture}</td>
                  <td className="px-6 py-5 text-lg font-bold flex items-center gap-2">
                    {t.Result === "Passed" ? (
                      <>
                        <CheckCircle2 className="text-green-500" size={22} />
                        <span className="text-green-500">{t.Result}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-500" size={22} />
                        <span className="text-red-500">{t.Result}</span>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-5 text-lg text-white">{t.Notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}