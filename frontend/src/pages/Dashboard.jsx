import { useEffect, useState, useRef } from "react";
import {
  Utensils,
  Users,
  Package,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from "lucide-react";

// --- Placeholder Data for Frontend Visuals ---
const PLACEHOLDER_OVERVIEW = {
  foodItems: 12,
  suppliers: 5,
  batches: 23,
  reports: 7,
};
const PLACEHOLDER_CHART = {
  passed: 18,
  failed: 5,
  safe: 15,
  highRisk: 3,
};
const PLACEHOLDER_REPORT = [
  {
    Food: "Apple",
    Supplier: "Fresh Farms",
    CFU: "120",
    Risk: "Safe",
    Result: "Passed",
  },
  {
    Food: "Spinach",
    Supplier: "GreenLeaf",
    CFU: "900",
    Risk: "High Risk",
    Result: "Failed",
  },
  {
    Food: "Tomato",
    Supplier: "Veggie Co",
    CFU: "300",
    Risk: "Safe",
    Result: "Passed",
  },
  {
    Food: "Chicken",
    Supplier: "Meat Masters",
    CFU: "1500",
    Risk: "High Risk",
    Result: "Failed",
  },
];
// --- End Placeholder Data ---

function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0);
  const raf = useRef();

  useEffect(() => {
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        raf.current = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    }
    raf.current = requestAnimationFrame(step);
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

export default function Dashboard() {
  const [overview, setOverview] = useState(PLACEHOLDER_OVERVIEW);
  const [chartData, setChartData] = useState(PLACEHOLDER_CHART);
  const [report, setReport] = useState(PLACEHOLDER_REPORT);
  const [flyIn, setFlyIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFlyIn(true), 50);
    // --- API Integration ---
    // Uncomment and remove placeholder data when backend is ready
    /*
    fetch("http://localhost:5000/api/dashboard-overview")
      .then((res) => res.json())
      .then(setOverview);
    fetch("http://localhost:5000/api/dashboard-charts")
      .then((res) => res.json())
      .then(setChartData);
    fetch("http://localhost:5000/api/full-quality-report")
      .then((res) => res.json())
      .then(setReport);
    */
    // --- End API Integration ---
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
  };

  // Animated counts
  const foodCount = useCountUp(overview.foodItems ?? 0);
  const supplierCount = useCountUp(overview.suppliers ?? 0);
  const batchCount = useCountUp(overview.batches ?? 0);
  const reportCount = useCountUp(overview.reports ?? 0);
  const passedCount = useCountUp(chartData.passed ?? 0);
  const failedCount = useCountUp(chartData.failed ?? 0);
  const safeCount = useCountUp(chartData.safe ?? 0);
  const highRiskCount = useCountUp(chartData.highRisk ?? 0);

  return (
    <div
      className={`max-w-6xl mx-auto py-6 px-2 flex flex-col items-center transition-all duration-700 ${
        flyIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Dashboard Heading */}
      <h2 className="w-full text-2xl font-extrabold mb-10 text-white text-left">Dashboard</h2>
      {/* Overview Cards */}
      <div className="w-full mb-12 flex flex-wrap gap-8 justify-center">
        <div
          className="border-2 rounded-2xl shadow-lg flex-1 min-w-[220px] max-w-[350px] p-6 flex flex-col justify-center"
          style={{ borderColor: accent.blue, background: accent.black }}
        >
          <div className="font-bold text-lg mb-2 text-white text-left">Total Food Items</div>
          <div className="flex items-center gap-4">
            <Utensils size={32} color={accent.blue} />
            <span className="text-4xl font-extrabold" style={{ color: accent.blue }}>
              {foodCount}
            </span>
          </div>
        </div>
        <div
          className="border-2 rounded-2xl shadow-lg flex-1 min-w-[220px] max-w-[350px] p-6 flex flex-col justify-center"
          style={{ borderColor: accent.pink, background: accent.black }}
        >
          <div className="font-bold text-lg mb-2 text-white text-left">Total Suppliers</div>
          <div className="flex items-center gap-4">
            <Users size={32} color={accent.pink} />
            <span className="text-4xl font-extrabold" style={{ color: accent.pink }}>
              {supplierCount}
            </span>
          </div>
        </div>
        <div
          className="border-2 rounded-2xl shadow-lg flex-1 min-w-[220px] max-w-[350px] p-6 flex flex-col justify-center"
          style={{ borderColor: accent.lime, background: accent.black }}
        >
          <div className="font-bold text-lg mb-2 text-white text-left">Total Batches</div>
          <div className="flex items-center gap-4">
            <Package size={32} color={accent.lime} />
            <span className="text-4xl font-extrabold" style={{ color: accent.lime }}>
              {batchCount}
            </span>
          </div>
        </div>
        <div
          className="border-2 rounded-2xl shadow-lg flex-1 min-w-[220px] max-w-[350px] p-6 flex flex-col justify-center"
          style={{ borderColor: accent.yellow, background: accent.black }}
        >
          <div className="font-bold text-lg mb-2 text-white text-left">Total Reports</div>
          <div className="flex items-center gap-4">
            <FileText size={32} color={accent.yellow} />
            <span className="text-4xl font-extrabold" style={{ color: accent.yellow }}>
              {reportCount}
            </span>
          </div>
        </div>
      </div>
      {/* Quality Summary Heading */}
      <h2 className="w-full text-2xl font-extrabold mb-10 text-white text-left">Quality Summary</h2>
      {/* Quality Summary Boxes */}
      <div className="w-full mb-12 flex flex-wrap gap-8 justify-center">
        <div
          className="border-2 rounded-2xl shadow-lg flex-1 min-w-[220px] max-w-[350px] p-6 flex flex-col justify-center"
          style={{ borderColor: accent.green, background: accent.black }}
        >
          <div className="font-extrabold text-lg mb-2 text-white text-left">Passed Tests</div>
          <div className="flex items-center gap-4">
            <CheckCircle2 size={32} color={accent.green} />
            <span className="text-4xl font-bold" style={{ color: accent.green }}>
              {passedCount}
            </span>
          </div>
        </div>
        <div
          className="border-2 rounded-2xl shadow-lg flex-1 min-w-[220px] max-w-[350px] p-6 flex flex-col justify-center"
          style={{ borderColor: accent.red, background: accent.black }}
        >
          <div className="font-extrabold text-lg mb-2 text-white text-left">Failed Tests</div>
          <div className="flex items-center gap-4">
            <XCircle size={32} color={accent.red} />
            <span className="text-4xl font-bold" style={{ color: accent.red }}>
              {failedCount}
            </span>
          </div>
        </div>
        <div
          className="border-2 rounded-2xl shadow-lg flex-1 min-w-[220px] max-w-[350px] p-6 flex flex-col justify-center"
          style={{ borderColor: accent.green, background: accent.black }}
        >
          <div className="font-extrabold text-lg mb-2 text-white text-left">Safe Products</div>
          <div className="flex items-center gap-4">
            <ShieldCheck size={32} color={accent.green} />
            <span className="text-4xl font-bold" style={{ color: accent.green }}>
              {safeCount}
            </span>
          </div>
        </div>
        <div
          className="border-2 rounded-2xl shadow-lg flex-1 min-w-[220px] max-w-[350px] p-6 flex flex-col justify-center"
          style={{ borderColor: accent.red, background: accent.black }}
        >
          <div className="font-extrabold text-lg mb-2 text-white text-left">High Risk Products</div>
          <div className="flex items-center gap-4">
            <AlertTriangle size={32} color={accent.red} />
            <span className="text-4xl font-bold" style={{ color: accent.red }}>
              {highRiskCount}
            </span>
          </div>
        </div>
      </div>
      {/* Full Quality Report Table */}
      <div className="w-full">
        <h2 className="w-full text-2xl font-extrabold mb-10 text-white text-left">Full Quality Report</h2>
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
              {report.map((r, idx) => (
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
                  <td className="px-6 py-5 font-bold">
                    <span className="flex items-center gap-2 text-lg">
                      {r.Risk === "High Risk" ? (
                        <AlertTriangle size={22} color={accent.red} />
                      ) : (
                        <ShieldCheck size={22} color={accent.green} />
                      )}
                      <span
                        style={{
                          color: r.Risk === "High Risk" ? accent.red : accent.green,
                          fontWeight: 600,
                        }}
                      >
                        {r.Risk}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold">
                    <span className="flex items-center gap-2 text-lg">
                      {r.Result === "Passed" ? (
                        <CheckCircle2 size={22} color={accent.green} />
                      ) : (
                        <XCircle size={22} color={accent.red} />
                      )}
                      <span
                        style={{
                          color: r.Result === "Passed" ? accent.green : accent.red,
                          fontWeight: 600,
                        }}
                      >
                        {r.Result}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* --- API Integration Note ---
            Remove placeholder data and uncomment API fetch in useEffect
            to connect this table to backend.
        */}
      </div>
    </div>
  );
}