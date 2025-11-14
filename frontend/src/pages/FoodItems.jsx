import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

// --- Sample Data for UI Preview ---
const SAMPLE_ITEMS = [
  { FoodID: 1, Name: "Apple", Category: "Fruit", Description: "Fresh red apple" },
  { FoodID: 2, Name: "Spinach", Category: "Vegetable", Description: "Leafy green" },
  { FoodID: 3, Name: "Chicken", Category: "Meat", Description: "Boneless breast" },
];
// --- End Sample Data ---

export default function FoodItems() {
  const [items, setItems] = useState(SAMPLE_ITEMS);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [flyIn, setFlyIn] = useState(false);
  const [newItemId, setNewItemId] = useState(null);

  useEffect(() => {
    setTimeout(() => setFlyIn(true), 50);
    // Uncomment for real API
    /*
    fetch("http://localhost:5000/api/food")
      .then((res) => res.json())
      .then(setItems);
    */
  }, []);

  function addItem(e) {
    e.preventDefault();
    // Uncomment for real API
    /*
    fetch("http://localhost:5000/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, description: desc }),
    })
      .then((res) => res.json())
      .then((newItem) => setItems([...items, newItem]));
    */
    // Sample logic for UI
    const newItem = {
      FoodID: items.length + 1,
      Name: name,
      Category: category,
      Description: desc,
    };
    setItems([...items, newItem]);
    setNewItemId(newItem.FoodID);
    setName("");
    setCategory("");
    setDesc("");
    setTimeout(() => setNewItemId(null), 700);
  }

  function deleteItem(id) {
    // Uncomment for real API
    /*
    fetch(`http://localhost:5000/api/food/${id}`, { method: "DELETE" })
      .then(() => setItems(items.filter((item) => item.FoodID !== id)));
    */
    // Sample logic for UI
    setItems(items.filter((item) => item.FoodID !== id));
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
      className={`max-w-6xl mx-auto py-6 px-2 flex flex-col items-center transition-all duration-700 ${
        flyIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <h2 className="w-full text-2xl font-extrabold mb-10 text-white text-left">Food Items</h2>
      <form
        onSubmit={addItem}
        className="w-full mb-8 grid grid-cols-[1fr_1fr_1fr_auto] gap-6 items-center"
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
        <input
          className="border-2 rounded-2xl p-3 text-lg text-white placeholder-white w-full"
          style={{
            borderColor: accent.pink,
            background: accent.black,
          }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          required
        />
        <input
          className="border-2 rounded-2xl p-3 text-lg text-white placeholder-white w-full"
          style={{
            borderColor: accent.lime,
            background: accent.black,
          }}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
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
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>ID</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Name</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Category</th>
                <th className="px-6 py-4 text-xl font-bold text-left text-white border-b-2" style={{ borderColor: accent.dark }}>Description</th>
                <th className="px-6 py-4 text-xl font-bold text-center text-white border-b-2" style={{ borderColor: accent.dark }}>Actions</th>
              </tr>
              <tr>
                <td colSpan={5}>
                  <div className="w-full border-b-4 border-white"></div>
                </td>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.FoodID}
                  className={`transition-all duration-700 ${
                    newItemId === item.FoodID
                      ? "opacity-100 translate-x-0"
                      : "opacity-100"
                  } ${newItemId === item.FoodID ? "-translate-x-8" : ""}`}
                  style={{
                    background: accent.black,
                    borderBottom: `2px solid ${accent.dark}`,
                    ...(newItemId === item.FoodID
                      ? {
                          opacity: 1,
                          transform: "translateX(32px)",
                        }
                      : {}),
                  }}
                >
                  <td className="px-6 py-5 text-lg text-white">{item.FoodID}</td>
                  <td className="px-6 py-5 text-lg text-white font-bold">{item.Name}</td>
                  <td className="px-6 py-5 text-lg text-white font-bold">{item.Category}</td>
                  <td className="px-6 py-5 text-lg text-white">{item.Description}</td>
                  <td className="px-6 py-5 text-center">
                    <button
                      className="bg-transparent hover:bg-red-100 px-2 py-2 rounded-xl flex justify-center mx-auto"
                      onClick={() => deleteItem(item.FoodID)}
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