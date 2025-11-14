const express = require("express");
const cors = require("cors");
const { getConnection } = require("./db");
const oracledb = require("oracledb");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Food Items
app.get("/api/food", async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(`SELECT FoodID, Description FROM FoodItem ORDER BY FoodID`);
    await conn.close();
    res.json(result.rows.map(([FoodID, Description]) => ({ FoodID, Description })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/food", async (req, res) => {
  const { description } = req.body;
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `INSERT INTO FoodItem (FoodID, Description) 
       VALUES (FoodItem_seq.NEXTVAL, :desc) 
       RETURNING FoodID INTO :id`,
      { desc: description, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
      { autoCommit: true }
    );
    const newId = result.outBinds.id[0];
    await conn.close();
    res.json({ FoodID: newId, Description: description });
  } catch (err) {
    console.error("❌ Insert Food Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/food/:id", async (req, res) => {
  try {
    const conn = await getConnection();
    await conn.execute(`DELETE FROM FoodItem WHERE FoodID = :id`, [req.params.id], { autoCommit: true });
    await conn.close();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Suppliers
app.get("/api/supplier", async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(`SELECT SupplierID, Name FROM Supplier ORDER BY SupplierID`);
    await conn.close();
    res.json(result.rows.map(([SupplierID, Name]) => ({ SupplierID, Name })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/supplier", async (req, res) => {
  const { name } = req.body;
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `INSERT INTO Supplier (SupplierID, Name) 
       VALUES (Supplier_seq.NEXTVAL, :name) 
       RETURNING SupplierID INTO :id`,
      { name, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
      { autoCommit: true }
    );
    const newId = result.outBinds.id[0];
    await conn.close();
    res.json({ SupplierID: newId, Name: name });
  } catch (err) {
    console.error("❌ Insert Supplier Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/supplier/:id", async (req, res) => {
  try {
    const conn = await getConnection();
    await conn.execute(`DELETE FROM Supplier WHERE SupplierID = :id`, [req.params.id], { autoCommit: true });
    await conn.close();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Batches
app.get("/api/batch", async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT BatchID, FoodID, SupplierID, Status FROM Batch ORDER BY BatchID`
    );
    await conn.close();
    res.json(result.rows.map(([BatchID, FoodID, SupplierID, Status]) => ({ BatchID, FoodID, SupplierID, Status })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/batch", async (req, res) => {
  const { foodId, supplierId, status } = req.body;
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `INSERT INTO Batch (BatchID, FoodID, SupplierID, Status)
       VALUES (Batch_seq.NEXTVAL, :foodId, :supplierId, :status)
       RETURNING BatchID INTO :id`,
      { foodId, supplierId, status, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
      { autoCommit: true }
    );
    const newId = result.outBinds.id[0];
    await conn.close();
    res.json({ BatchID: newId, FoodID: foodId, SupplierID: supplierId, Status: status });
  } catch (err) {
    console.error("❌ Insert Batch Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/batch/:id", async (req, res) => {
  try {
    const conn = await getConnection();
    await conn.execute(`DELETE FROM Batch WHERE BatchID = :id`, [req.params.id], { autoCommit: true });
    await conn.close();
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Default route
app.get("/", (req, res) => {
  res.send("✅ EatSafe backend API is running properly.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
