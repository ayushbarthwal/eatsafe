import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

// --- Sample Data for UI Preview ---
const SAMPLE_PREDICTIONS = [
  { Temperature: 4, Humidity: 80, CFU: 120, Risk: "Safe" },
  { Temperature: 10, Humidity: 90, CFU: 1500, Risk: "High Risk" },
  { Temperature: 7, Humidity: 85, CFU: 300, Risk: "Safe" },
];
// --- End Sample Data ---

export default function Predictions() {
  const [predictions, setPredictions] = useState(SAMPLE_PREDICTIONS);
  const [flyIn, setFlyIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFlyIn(true), 50);
    // Uncomment for real API
    /*
    fetch("http://localhost:5000/api/predictions")
      .then((res) => res.json())
      .then(setPredictions);
    */
  }, []);

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
    <div
      className={`max-w-6xl mx-auto py-6 px-2 flex flex-col items-center transition-all duration-700 ${
        flyIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <h2 className="w-full text-2xl font-extrabold mb-10 text-white text-left">Predictions</h2>
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
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Temperature</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Humidity</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>CFU</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Risk</th>
              </tr>
              <tr>
                <td colSpan={4}>
                  <div className="w-full border-b-4 border-white"></div>
                </td>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, idx) => (
                <tr
                  key={idx}
                  style={{
                    background: accent.black,
                    borderBottom: `2px solid ${accent.dark}`,
                  }}
                >
                  <td className="px-6 py-5 text-lg text-white">{p.Temperature}</td>
                  <td className="px-6 py-5 text-lg text-white">{p.Humidity}</td>
                  <td className={`px-6 py-5 text-lg font-bold ${p.CFU > 1000 ? "text-red-500" : "text-green-500"}`}>
                    {p.CFU}
                  </td>
                  <td className="px-6 py-5 text-lg font-bold flex items-center gap-2">
                    {p.Risk === "High Risk" ? (
                      <>
                        <AlertTriangle className="text-red-500" size={22} />
                        <span className="text-red-500">{p.Risk}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="text-green-500" size={22} />
                        <span className="text-green-500">{p.Risk}</span>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}