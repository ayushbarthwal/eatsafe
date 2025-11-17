import { useEffect, useState, useRef } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [batchId, setBatchId] = useState("");
  const [batches, setBatches] = useState([]);
  const [flyIn, setFlyIn] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const autoRef = useRef(null);

  // toast text ("" = hidden)
  const [toast, setToast] = useState("");

  useEffect(() => {
    setTimeout(() => setFlyIn(true), 50);
    fetchBatches();
    fetchPredictions("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (autoUpdate) {
      autoRef.current = setInterval(() => {
        fetchPredictions("auto");
      }, 10000);
    } else {
      if (autoRef.current) clearInterval(autoRef.current);
      autoRef.current = null;
    }

    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [autoUpdate, batchId]);

  async function fetchBatches() {
    try {
      const res = await fetch("http://localhost:5000/api/batch");
      const data = await res.json();
      setBatches(data || []);
    } catch (err) {
      console.error("Error fetching batches", err);
      setBatches([]);
    }
  }

  // source: "auto" | "refresh" | "manual"
  async function fetchPredictions(source = "auto") {
    try {
      const q = new URLSearchParams();
      if (batchId) q.append("batchId", batchId);
      q.append("limit", 50);

      const res = await fetch(`http://localhost:5000/api/predictions?${q.toString()}`);
      const data = await res.json();

      const mapped = (data || []).map((p) => ({
        PredictionID: p.PREDICTIONID,
        BatchID: p.BATCHID,
        Temperature: p.TEMPERATURE,
        Humidity: p.HUMIDITY,
        CFU: p.CFU,
        Risk: p.RISK,
        CreatedAt: p.CREATEDAT,
        xLabel: p.CREATEDAT,
      }));

      // detect new rows compared to previous state
      const oldCount = predictions.length;
      const newCount = mapped.length;

      setPredictions(mapped);

      // Only show toast when update source is auto or refresh AND new rows were added
      if ((source === "auto" || source === "refresh") && newCount > oldCount) {
        setToast("New predictions loaded");
        setTimeout(() => setToast(""), 2000);
      }
    } catch (err) {
      console.error("Error fetching predictions", err);
      setPredictions([]);
    }
  }

  // call ML endpoint and optionally save
  async function handlePredict(save = true) {
    if (temperature === "" || humidity === "") {
      return alert("Enter temperature & humidity");
    }

    try {
      const body = {
        temperature: Number(temperature),
        humidity: Number(humidity),
        save,
      };

      if (batchId) body.batchId = Number(batchId);

      const res = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.Saved) {
          // saved to DB — refresh from server but mark as manual to avoid toast
          await fetchPredictions("manual");
        } else {
          // not saved — append locally so user sees it instantly
          setPredictions((prev) => [
            ...prev,
            {
              PredictionID: null,
              BatchID: batchId || null,
              Temperature: data.Temperature,
              Humidity: data.Humidity,
              CFU: data.CFU,
              Risk: data.Risk,
              CreatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
              xLabel: new Date().toLocaleTimeString(),
            },
          ]);
        }
      } else {
        alert(data.error || "Prediction failed");
      }
    } catch (err) {
      console.error("Prediction API error", err);
      alert("Prediction API error");
    }
  }

  const accent = {
    green: "#22c55e",
    red: "#ef4444",
    black: "#18122b",
    dark: "#23272f",
    white: "#fff",
  };

  const chartData = [...predictions].reverse().map((p, idx) => ({
    name: p.xLabel || `#${p.PredictionID ?? idx}`,
    CFU: p.CFU,
    // safety fallback if keys are uppercase from DB
    Temperature: Number(p.Temperature || p.TEMPERATURE || 0),
  }));

  return (
    <div
      className={`max-w-6xl mx-auto py-6 px-2 flex flex-col items-center transition-all duration-700 ${
        flyIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Inline animation CSS & toast positioned here so you don't need extra CSS files */}
      <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein { animation: fadein 0.45s ease-out; }
        .toast-fade { animation: fadein 0.3s ease-out; }
      `}</style>

      {/* Toast (top-right) */}
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-xl shadow-xl toast-fade z-50">
          {toast}
        </div>
      )}

      <h2 className="w-full text-2xl font-extrabold mb-6 text-white text-left">Predictions</h2>

      {/* Controls */}
      <div className="w-full mb-4 flex flex-wrap gap-3 items-center">
        <select
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="p-3 rounded-xl text-white border-2"
          style={{ background: accent.black, borderColor: accent.green }}
        >
          <option value="">All Batches</option>
          {batches.map((b) => {
            const id = b.BatchID || b.BATCHID;
            return (
              <option key={id} value={id}>
                Batch #{id}
              </option>
            );
          })}
        </select>

        <label className="text-white">Auto-update</label>
        <input
          type="checkbox"
          checked={autoUpdate}
          onChange={(e) => setAutoUpdate(e.target.checked)}
        />

        <button
          onClick={() => fetchPredictions("refresh")}
          className="px-4 py-2 rounded-xl font-bold"
          style={{
            border: `2px solid ${accent.green}`,
            color: accent.green,
            background: "transparent",
          }}
        >
          Refresh
        </button>
      </div>

      {/* Inputs */}
      <div className="w-full mb-6 flex gap-3">
        <input
          type="number"
          placeholder="Temperature (°C)"
          className="p-3 rounded-xl text-white border-2"
          style={{ background: accent.black, borderColor: accent.green }}
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
        />
        <input
          type="number"
          placeholder="Humidity (%)"
          className="p-3 rounded-xl text-white border-2"
          style={{ background: accent.black, borderColor: accent.green }}
          value={humidity}
          onChange={(e) => setHumidity(e.target.value)}
        />

        <button
          onClick={() => handlePredict(true)}
          className="px-6 py-3 rounded-xl font-bold text-white"
          style={{ background: accent.green }}
        >
          Predict & Save
        </button>

        <button
          onClick={() => handlePredict(false)}
          className="px-4 py-3 rounded-xl font-bold"
          style={{
            background: "transparent",
            border: `2px solid ${accent.dark}`,
            color: accent.white,
          }}
        >
          Predict (no save)
        </button>
      </div>

      {/* Chart */}
      <div className="w-full mb-6" style={{ height: 320 }}>
        <div
          className="w-full rounded-2xl overflow-hidden shadow-lg border-2"
          style={{ background: accent.black, borderColor: accent.dark, padding: 12 }}
        >
          <h3 className="text-white font-bold mb-2">CFU Over Time</h3>

          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#2b2b2b" />
              <XAxis dataKey="name" tick={{ fill: "#fff" }} />
              <YAxis tick={{ fill: "#fff" }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="CFU"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table
          className="min-w-full rounded-2xl overflow-hidden shadow-lg border-2"
          style={{ background: accent.black, borderColor: accent.dark }}
        >
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-white">When</th>
              <th className="px-6 py-3 text-left text-white">Batch</th>
              <th className="px-6 py-3 text-left text-white">Temp (°C)</th>
              <th className="px-6 py-3 text-left text-white">Humidity (%)</th>
              <th className="px-6 py-3 text-left text-white">CFU</th>
              <th className="px-6 py-3 text-left text-white">Risk</th>
            </tr>
          </thead>

          <tbody>
            {predictions.map((p, i) => (
              <tr
                key={p.PredictionID ?? i}
                className="transition-all duration-500 ease-out animate-fadein"
                style={{ borderBottom: `1px solid ${accent.dark}` }}
              >
                <td className="px-6 py-3 text-white">
                  {p.CreatedAt || p.xLabel || "-"}
                </td>
                <td className="px-6 py-3 text-white">
                  {p.BatchID ?? p.BATCHID ?? "-"}
                </td>
                <td className="px-6 py-3 text-white">{p.Temperature ?? p.TEMPERATURE}</td>
                <td className="px-6 py-3 text-white">{p.Humidity ?? p.HUMIDITY}</td>
                <td
                  className={`px-6 py-3 font-bold ${
                    (p.CFU || p.CFU === 0) && p.CFU > 1000 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {p.CFU}
                </td>
                <td className="px-6 py-3 text-white flex items-center gap-2">
                  {p.Risk === "High Risk" || p.RISK === "High Risk" ? (
                    <>
                      <AlertTriangle className="text-red-500" size={18} />
                      <span className="text-red-500">{p.Risk || p.RISK}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="text-green-500" size={18} />
                      <span className="text-green-500">{p.Risk || p.RISK}</span>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
