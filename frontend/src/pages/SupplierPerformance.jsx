import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

// --- Sample Data for UI Preview ---
const SAMPLE_PERFORMANCE = [
  { Supplier: "Fresh Farms", Reliability: 92 },
  { Supplier: "GreenLeaf", Reliability: 75 },
  { Supplier: "Veggie Co", Reliability: 58 },
];
// --- End Sample Data ---

export default function SupplierPerformance() {
  const [performance, setPerformance] = useState(SAMPLE_PERFORMANCE);
  const [flyIn, setFlyIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFlyIn(true), 50);
    // Uncomment for real API
    /*
    fetch("http://localhost:5000/api/supplier-performance")
      .then((res) => res.json())
      .then(setPerformance);
    */
  }, []);

  function getBadge(percent) {
    if (percent > 80)
      return (
        <span className="flex items-center gap-2 font-bold text-green-500">
          <CheckCircle2 size={22} className="text-green-500" />
          Reliable
        </span>
      );
    if (percent < 60)
      return (
        <span className="flex items-center gap-2 font-bold text-red-500">
          <XCircle size={22} className="text-red-500" />
          Low
        </span>
      );
    return (
      <span className="flex items-center gap-2 font-bold text-yellow-400">
        <AlertTriangle size={22} className="text-yellow-400" />
        Medium
      </span>
    );
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
    <div className={`max-w-4xl mx-auto py-6 px-2 flex flex-col items-center transition-all duration-700 ${
      flyIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    }`}>
      <h2 className="w-full text-2xl font-extrabold mb-10 text-white text-left">Supplier Performance</h2>
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
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Supplier</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Reliability %</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Badge</th>
              </tr>
              <tr>
                <td colSpan={3}>
                  <div className="w-full border-b-4 border-white"></div>
                </td>
              </tr>
            </thead>
            <tbody>
              {performance.map((p, idx) => (
                <tr
                  key={idx}
                  style={{
                    background: accent.black,
                    borderBottom: `2px solid ${accent.dark}`,
                  }}
                >
                  <td className="px-6 py-5 text-lg text-white font-bold">{p.Supplier}</td>
                  <td className="px-6 py-5 text-lg text-white font-bold">{p.Reliability}</td>
                  <td className="px-6 py-5">{getBadge(p.Reliability)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}