import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Trash2, Plus } from "lucide-react";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [foods, setFoods] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [foodId, setFoodId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState("");

  const [flyIn, setFlyIn] = useState(false);
  const [newBatchId, setNewBatchId] = useState(null);

  // ---------------------------------------------------
  // LOAD ALL DATA FROM BACKEND (Batches, Food, Supplier)
  // ---------------------------------------------------
  useEffect(() => {
    setTimeout(() => setFlyIn(true), 50);

    fetch("http://localhost:5000/api/batch")
      .then((res) => res.json())
      .then(setBatches);

    fetch("http://localhost:5000/api/food")
      .then((res) => res.json())
      .then(setFoods);

    fetch("http://localhost:5000/api/supplier")
      .then((res) => res.json())
      .then(setSuppliers);
  }, []);

  // ---------------------------------------------------
  // ADD A NEW BATCH (POST to backend)
  // ---------------------------------------------------
  function addBatch(e) {
    e.preventDefault();

    fetch("http://localhost:5000/api/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foodId: Number(foodId),
        supplierId: Number(supplierId),
        status,
      }),
    })
      .then((res) => res.json())
      .then((newBatch) => {
        setBatches([...batches, newBatch]);
        setNewBatchId(newBatch.BatchID);

        setFoodId("");
        setSupplierId("");
        setStatus("");

        setTimeout(() => setNewBatchId(null), 700);
      });
  }

  // ---------------------------------------------------
  // DELETE BATCH (DELETE API)
  // ---------------------------------------------------
  function deleteBatch(id) {
    fetch(`http://localhost:5000/api/batch/${id}`, {
      method: "DELETE",
    }).then(() => {
      setBatches(batches.filter((b) => b.BatchID !== id));
    });
  }

  // ---------------------------------------------------
  // Helper Functions to Display Names Instead of IDs
  // ---------------------------------------------------
  function getFoodName(id) {
    const f = foods.find((x) => x.FoodID === id);
    return f ? f.Description : id;
  }

  function getSupplierName(id) {
    const s = suppliers.find((x) => x.SupplierID === id);
    return s ? s.Name : id;
  }

  // Accent colors
  const accent = {
    blue: "#61dafb",
    pink: "#ff61e6",
    lime: "#a3e635",
    green: "#22c55e",
    red: "#ef4444",
    black: "#18122b",
    dark: "#23272f",
    white: "#fff",
  };

  return (
    <div
      className={`max-w-6xl mx-auto py-6 px-2 flex flex-col items-center transition-all duration-700 ${
        flyIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <h2 className="w-full text-2xl font-extrabold mb-10 text-white text-left">
        Batches
      </h2>

      {/* --------------------- FORM --------------------- */}
      <form
        onSubmit={addBatch}
        className="w-full mb-8 flex gap-6 items-center"
      >
        {/* Select Food */}
        <div className="relative flex-1">
          <select
            className="border-2 rounded-2xl p-3 text-lg text-white w-full appearance-none"
            style={{ borderColor: accent.blue, background: accent.black }}
            value={foodId}
            onChange={(e) => setFoodId(e.target.value)}
            required
          >
            <option value="">Select Food</option>
            {foods.map((f) => (
              <option key={f.FoodID} value={f.FoodID}>
                {f.Description}
              </option>
            ))}
          </select>
        </div>

        {/* Select Supplier */}
        <div className="relative flex-1">
          <select
            className="border-2 rounded-2xl p-3 text-lg text-white w-full appearance-none"
            style={{ borderColor: accent.pink, background: accent.black }}
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s.SupplierID} value={s.SupplierID}>
                {s.Name}
              </option>
            ))}
          </select>
        </div>

        {/* Select Status */}
        <div className="relative flex-1">
          <select
            className="border-2 rounded-2xl p-3 text-lg text-white w-full appearance-none"
            style={{ borderColor: accent.lime, background: accent.black }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Add Button */}
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

      {/* --------------------- TABLE --------------------- */}
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
                <th className="px-6 py-4 text-xl text-left text-white border-b-2">
                  Batch ID
                </th>
                <th className="px-6 py-4 text-xl text-left text-white border-b-2">
                  Food
                </th>
                <th className="px-6 py-4 text-xl text-left text-white border-b-2">
                  Supplier
                </th>
                <th className="px-6 py-4 text-xl text-left text-white border-b-2">
                  Status
                </th>
                <th className="px-6 py-4 text-xl text-center text-white border-b-2">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {batches.map((b) => (
                <tr
                  key={b.BatchID}
                  className="transition-all duration-700"
                  style={{
                    background: accent.black,
                    borderBottom: `2px solid ${accent.dark}`,
                  }}
                >
                  <td className="px-6 py-5 text-lg text-white">{b.BatchID}</td>

                  <td className="px-6 py-5 text-lg text-white font-bold">
                    {getFoodName(b.FoodID)}
                  </td>

                  <td className="px-6 py-5 text-lg text-white font-bold">
                    {getSupplierName(b.SupplierID)}
                  </td>

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
    </div>
  );
}
