import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Trash2, Plus } from "lucide-react";

// --- Placeholder Data for Frontend Visuals ---
const PLACEHOLDER_BATCHES = [
  { BatchID: 1, FoodID: "Apple", SupplierID: "Fresh Farms", Status: "Active" },
  { BatchID: 2, FoodID: "Spinach", SupplierID: "GreenLeaf", Status: "Inactive" },
  { BatchID: 3, FoodID: "Tomato", SupplierID: "Veggie Co", Status: "Active" },
];
const PLACEHOLDER_FOODS = [
  { FoodID: "Apple", Description: "Apple" },
  { FoodID: "Spinach", Description: "Spinach" },
  { FoodID: "Tomato", Description: "Tomato" },
];
const PLACEHOLDER_SUPPLIERS = [
  { SupplierID: "Fresh Farms", Name: "Fresh Farms" },
  { SupplierID: "GreenLeaf", Name: "GreenLeaf" },
  { SupplierID: "Veggie Co", Name: "Veggie Co" },
];
// --- End Placeholder Data ---

export default function Batches() {
  const [batches, setBatches] = useState(PLACEHOLDER_BATCHES);
  const [foods, setFoods] = useState(PLACEHOLDER_FOODS);
  const [suppliers, setSuppliers] = useState(PLACEHOLDER_SUPPLIERS);
  const [foodId, setFoodId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState("");
  const [flyIn, setFlyIn] = useState(false);
  const [newBatchId, setNewBatchId] = useState(null);

  useEffect(() => {
    setTimeout(() => setFlyIn(true), 50);
    // --- API Integration ---
    // Uncomment and remove placeholder data when backend is ready
    /*
    fetch("http://localhost:5000/api/batch")
      .then((res) => res.json())
      .then(setBatches);
    fetch("http://localhost:5000/api/food")
      .then((res) => res.json())
      .then(setFoods);
    fetch("http://localhost:5000/api/supplier")
      .then((res) => res.json())
      .then(setSuppliers);
    */
    // --- End API Integration ---
  }, []);

  function addBatch(e) {
    e.preventDefault();
    const newBatch = {
      BatchID: batches.length + 1,
      FoodID: foodId,
      SupplierID: supplierId,
      Status: status,
    };
    setBatches([...batches, newBatch]);
    setNewBatchId(newBatch.BatchID);
    setFoodId("");
    setSupplierId("");
    setStatus("");
    setTimeout(() => setNewBatchId(null), 700); // Remove animation after 700ms
  }

  function deleteBatch(id) {
    setBatches(batches.filter((b) => b.BatchID !== id));
  }

  // Accent colors (same as Dashboard)
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
        flyIn
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
    >
      <h2 className="w-full text-2xl font-extrabold mb-10 text-white text-left">Batches</h2>
      <form
        onSubmit={addBatch}
        className="w-full mb-8 flex gap-6 items-center"
      >
        <div className="relative flex-1">
          <select
            className="border-2 rounded-2xl p-3 text-lg text-white placeholder-white w-full pr-10 appearance-none"
            style={{
              borderColor: accent.blue,
              background: accent.black,
            }}
            value={foodId}
            onChange={(e) => setFoodId(e.target.value)}
            required
          >
            <option value="" className="text-black">Select Food</option>
            {foods.map((f) => (
              <option key={f.FoodID} value={f.FoodID} className="text-black">{f.Description}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-white">
            ▼
          </span>
        </div>
        <div className="relative flex-1">
          <select
            className="border-2 rounded-2xl p-3 text-lg text-white placeholder-white w-full pr-10 appearance-none"
            style={{
              borderColor: accent.pink,
              background: accent.black,
            }}
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
          >
            <option value="" className="text-black">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.SupplierID} value={s.SupplierID} className="text-black">{s.Name}</option>
            ))}
          </select>
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-white">
            ▼
          </span>
        </div>
        <div className="relative flex-1">
          <select
            className="border-2 rounded-2xl p-3 text-lg text-white placeholder-white w-full pr-10 appearance-none"
            style={{
              borderColor: accent.lime,
              background: accent.black,
            }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="" className="text-black">Select Status</option>
            <option value="Active" className="text-black">Active</option>
            <option value="Inactive" className="text-black">Inactive</option>
          </select>
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-white">
            ▼
          </span>
        </div>
        <button
          className="flex items-center justify-center w-12 h-12 rounded-full border-2 backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: accent.white,
            borderColor: accent.white,
          }}
          type="submit"
        >
          <Plus size={28} color={accent.white} />
        </button>
      </form>
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
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Batch ID</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Food</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Supplier</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Status</th>
                <th className="px-6 py-4 text-xl font-bold text-center text-white border-b-2" style={{ borderColor: accent.dark }}>Actions</th>
              </tr>
              <tr>
                <td colSpan={5}>
                  <div className="w-full border-b-4 border-white"></div>
                </td>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr
                  key={b.BatchID}
                  className={`transition-all duration-700 ${
                    newBatchId === b.BatchID
                      ? "opacity-100 -translate-x-0"
                      : "opacity-100"
                  } ${newBatchId === b.BatchID ? "translate-x-8" : ""}`}
                  style={{
                    background: accent.black,
                    borderBottom: `2px solid ${accent.dark}`,
                    ...(newBatchId === b.BatchID
                      ? {
                          opacity: 1,
                          transform: "translateX(-32px)",
                        }
                      : {}),
                  }}
                >
                  <td className="px-6 py-5 text-lg text-white">{b.BatchID}</td>
                  <td className="px-6 py-5 text-lg text-white font-bold">{b.FoodID}</td>
                  <td className="px-6 py-5 text-lg text-white font-bold">{b.SupplierID}</td>
                  <td className="px-6 py-5 text-lg font-bold flex items-center gap-2">
                    {b.Status === "Active" ? (
                      <>
                        <CheckCircle className="text-green-500" size={22} />
                        <span className="text-green-500">{b.Status}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-500" size={22} />
                        <span className="text-red-500">{b.Status}</span>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      className="bg-transparent hover:bg-red-100 px-2 py-2 rounded-xl flex justify-center mx-auto"
                      onClick={() => deleteBatch(b.BatchID)}
                      title="Delete"
                    >
                      <Trash2 className="text-red-500 mx-auto" size={22} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* --- API Integration Note ---
          Remove placeholder data and uncomment API fetch in useEffect
          to connect this table to backend.
      */}
    </div>
  );
}