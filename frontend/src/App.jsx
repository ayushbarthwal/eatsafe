import { useState, useEffect } from "react";

function FoodItems() {
  const [items, setItems] = useState([]);
  const [desc, setDesc] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/food")
      .then((res) => res.json())
      .then(setItems);
  }, []);

  function addItem(e) {
    e.preventDefault();
    fetch("http://localhost:5000/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: desc }),
    })
      .then((res) => res.json())
      .then((newItem) => setItems([...items, newItem]));
    setDesc("");
  }

  function deleteItem(id) {
    fetch(`http://localhost:5000/api/food/${id}`, { method: "DELETE" })
      .then(() => setItems(items.filter((item) => item.FoodID !== id)));
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Food Items</h2>
      <form onSubmit={addItem} className="mb-2 flex gap-2">
        <input
          className="border p-1"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Food description"
          required
        />
        <button className="bg-blue-500 text-white px-2 py-1 rounded" type="submit">
          Add
        </button>
      </form>
      <table className="min-w-full border mb-4">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Description</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.FoodID}>
              <td className="border px-2 py-1">{item.FoodID}</td>
              <td className="border px-2 py-1">{item.Description}</td>
              <td className="border px-2 py-1">
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => deleteItem(item.FoodID)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/supplier")
      .then((res) => res.json())
      .then(setSuppliers);
  }, []);

  function addSupplier(e) {
    e.preventDefault();
    fetch("http://localhost:5000/api/supplier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then((newSupplier) => setSuppliers([...suppliers, newSupplier]));
    setName("");
  }

  function deleteSupplier(id) {
    fetch(`http://localhost:5000/api/supplier/${id}`, { method: "DELETE" })
      .then(() => setSuppliers(suppliers.filter((s) => s.SupplierID !== id)));
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Suppliers</h2>
      <form onSubmit={addSupplier} className="mb-2 flex gap-2">
        <input
          className="border p-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Supplier name"
          required
        />
        <button className="bg-blue-500 text-white px-2 py-1 rounded" type="submit">
          Add
        </button>
      </form>
      <table className="min-w-full border mb-4">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.SupplierID}>
              <td className="border px-2 py-1">{s.SupplierID}</td>
              <td className="border px-2 py-1">{s.Name}</td>
              <td className="border px-2 py-1">
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => deleteSupplier(s.SupplierID)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Batches() {
  const [batches, setBatches] = useState([]);
  const [foodId, setFoodId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/batch")
      .then((res) => res.json())
      .then(setBatches);
  }, []);

  function addBatch(e) {
    e.preventDefault();
    fetch("http://localhost:5000/api/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodId, supplierId, status }),
    })
      .then((res) => res.json())
      .then((newBatch) => setBatches([...batches, newBatch]));
    setFoodId("");
    setSupplierId("");
    setStatus("");
  }

  function deleteBatch(id) {
    fetch(`http://localhost:5000/api/batch/${id}`, { method: "DELETE" })
      .then(() => setBatches(batches.filter((b) => b.BatchID !== id)));
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Batches</h2>
      <form onSubmit={addBatch} className="mb-2 flex gap-2">
        <input
          className="border p-1"
          value={foodId}
          onChange={(e) => setFoodId(e.target.value)}
          placeholder="Food ID"
          required
        />
        <input
          className="border p-1"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          placeholder="Supplier ID"
          required
        />
        <input
          className="border p-1"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="Status"
          required
        />
        <button className="bg-blue-500 text-white px-2 py-1 rounded" type="submit">
          Add
        </button>
      </form>
      <table className="min-w-full border mb-4">
        <thead>
          <tr>
            <th className="border px-2 py-1">Batch ID</th>
            <th className="border px-2 py-1">Food ID</th>
            <th className="border px-2 py-1">Supplier ID</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => (
            <tr key={b.BatchID}>
              <td className="border px-2 py-1">{b.BatchID}</td>
              <td className="border px-2 py-1">{b.FoodID}</td>
              <td className="border px-2 py-1">{b.SupplierID}</td>
              <td className="border px-2 py-1">{b.Status}</td>
              <td className="border px-2 py-1">
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => deleteBatch(b.BatchID)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("food");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <nav className="mb-6 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${page === "food" ? "bg-blue-600 text-white" : "bg-white"}`}
          onClick={() => setPage("food")}
        >
          Food Items
        </button>
        <button
          className={`px-4 py-2 rounded ${page === "supplier" ? "bg-blue-600 text-white" : "bg-white"}`}
          onClick={() => setPage("supplier")}
        >
          Suppliers
        </button>
        <button
          className={`px-4 py-2 rounded ${page === "batch" ? "bg-blue-600 text-white" : "bg-white"}`}
          onClick={() => setPage("batch")}
        >
          Batches
        </button>
      </nav>
      {page === "food" && <FoodItems />}
      {page === "supplier" && <Suppliers />}
      {page === "batch" && <Batches />}
    </div>
  );
}