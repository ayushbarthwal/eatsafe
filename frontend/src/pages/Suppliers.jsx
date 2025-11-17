import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);   // ✅ real data only
  const [name, setName] = useState("");
  const [flyIn, setFlyIn] = useState(false);
  const [newSupplierId, setNewSupplierId] = useState(null);

  useEffect(() => {
    setTimeout(() => setFlyIn(true), 50);

    // ✅ Fetch suppliers from backend
    fetch("http://localhost:5000/api/supplier")
      .then((res) => res.json())
      .then(setSuppliers)
      .catch((err) => console.error("Fetch suppliers error:", err));
  }, []);

  function addSupplier(e) {
    e.preventDefault();

    // ✅ Add supplier to backend
    fetch("http://localhost:5000/api/supplier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then((newSupplier) => {
        setSuppliers([...suppliers, newSupplier]);
        setNewSupplierId(newSupplier.SupplierID);
        setName("");
        setTimeout(() => setNewSupplierId(null), 700);
      })
      .catch((err) => console.error("Add supplier error:", err));
  }

  function deleteSupplier(id) {
    // ✅ Delete supplier from backend
    fetch(`http://localhost:5000/api/supplier/${id}`, { method: "DELETE" })
      .then(() => {
        setSuppliers(suppliers.filter((s) => s.SupplierID !== id));
      })
      .catch((err) => console.error("Delete supplier error:", err));
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
    <div
      className={`max-w-4xl mx-auto py-6 px-2 flex flex-col items-center transition-all duration-700 ${
        flyIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <h2 className="w-full text-2xl font-extrabold mb-10 text-white text-left">
        Suppliers
      </h2>

      {/* Add Supplier Form */}
      <form
        onSubmit={addSupplier}
        className="w-full mb-8 grid grid-cols-[1fr_auto] gap-6 items-center"
      >
        <input
          className="border-2 rounded-2xl p-3 text-lg text-white placeholder-white w-full"
          style={{
            borderColor: accent.blue,
            background: accent.black,
          }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
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

      {/* Suppliers Table */}
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
                <th
                  className="px-6 py-4 text-xl font-bold text-left text-white border-b-2"
                  style={{ borderColor: accent.dark }}
                >
                  ID
                </th>
                <th
                  className="px-6 py-4 text-xl font-bold text-left text-white border-b-2"
                  style={{ borderColor: accent.dark }}
                >
                  Name
                </th>
                <th
                  className="px-6 py-4 text-xl font-bold text-center text-white border-b-2"
                  style={{ borderColor: accent.dark }}
                >
                  Actions
                </th>
              </tr>
              <tr>
                <td colSpan={3}>
                  <div className="w-full border-b-4 border-white"></div>
                </td>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((s) => (
                <tr
                  key={s.SupplierID}
                  className={`transition-all duration-700 ${
                    newSupplierId === s.SupplierID
                      ? "opacity-100 translate-x-0"
                      : "opacity-100"
                  } ${newSupplierId === s.SupplierID ? "-translate-x-8" : ""}`}
                  style={{
                    background: accent.black,
                    borderBottom: `2px solid ${accent.dark}`,
                    ...(newSupplierId === s.SupplierID
                      ? {
                          opacity: 1,
                          transform: "translateX(32px)",
                        }
                      : {}),
                  }}
                >
                  <td className="px-6 py-5 text-lg text-white">
                    {s.SupplierID}
                  </td>

                  <td className="px-6 py-5 text-lg text-white font-bold">
                    {s.Name}
                  </td>

                  <td className="px-6 py-5 text-center">
                    <button
                      className="bg-transparent hover:bg-red-100 px-2 py-2 rounded-xl flex justify-center mx-auto"
                      onClick={() => deleteSupplier(s.SupplierID)}
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
