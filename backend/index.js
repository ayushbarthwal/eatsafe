const express = require("express");
const cors = require("cors");
const { getConnection } = require("./db");
const oracledb = require("oracledb");
const { makePrediction } = require("./mlModel");

const app = express();
app.use(cors());
app.use(express.json());

/* ===========================================================
   FOOD ITEMS API
   =========================================================== */
app.get("/api/food", async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT FoodID, Name, Category, Description 
       FROM FoodItem 
       ORDER BY FoodID`
    );
    await conn.close();

    res.json(
      result.rows.map(([FoodID, Name, Category, Description]) => ({
        FoodID,
        Name,
        Category,
        Description,
      }))
    );
  } catch (err) {
    console.error("❌ GET /api/food Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   SUPPLIER LIST API
   =========================================================== */
app.get("/api/supplier", async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(`
      SELECT SupplierID, Name 
      FROM Supplier 
      ORDER BY SupplierID
    `);

    await conn.close();
    res.json(result.rows.map(([SupplierID, Name]) => ({ SupplierID, Name })));
  } catch (err) {
    console.error("❌ GET /api/supplier Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   SUPPLIER PERFORMANCE API
   =========================================================== */
app.get("/api/supplier-performance", async (req, res) => {
  try {
    const conn = await getConnection();

    const sql = `
      SELECT 
        s.Name AS Supplier,
        ROUND(
          (1 - (COUNT(CASE WHEN qt.RESULT = 'Fail' THEN 1 END) 
          / NULLIF(COUNT(qt.TestID), 0))) * 100
        ) AS Reliability
      FROM Supplier s
      LEFT JOIN Batch b ON s.SupplierID = b.SupplierID
      LEFT JOIN QualityTest qt ON qt.BatchID = b.BatchID
      GROUP BY s.Name
      ORDER BY Reliability DESC
    `;

    const result = await conn.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    await conn.close();

    res.json(
      result.rows.map((r) => ({
        Supplier: r.SUPPLIER,
        Reliability: Number(r.RELIABILITY) || 0,
      }))
    );
  } catch (err) {
    console.error("❌ /api/supplier-performance Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   DASHBOARD OVERVIEW API
   =========================================================== */
app.get("/api/dashboard-overview", async (req, res) => {
  try {
    const conn = await getConnection();

    const sql = `
      SELECT
        (SELECT COUNT(*) FROM FoodItem) AS FoodItems,
        (SELECT COUNT(*) FROM Supplier) AS Suppliers,
        (SELECT COUNT(*) FROM Batch) AS Batches,
        (SELECT COUNT(*) FROM QualityTest) AS Reports
      FROM dual
    `;

    const result = await conn.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    await conn.close();

    res.json({
      foodItems: result.rows[0].FOODITEMS,
      suppliers: result.rows[0].SUPPLIERS,
      batches: result.rows[0].BATCHES,
      reports: result.rows[0].REPORTS,
    });
  } catch (err) {
    console.error("❌ /api/dashboard-overview Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   DASHBOARD CHARTS API
   =========================================================== */
app.get("/api/dashboard-charts", async (req, res) => {
  try {
    const conn = await getConnection();

    const sql = `
      SELECT
        (SELECT COUNT(*) FROM QualityTest WHERE RESULT = 'Pass') AS Passed,
        (SELECT COUNT(*) FROM QualityTest WHERE RESULT = 'Fail') AS Failed,
        (SELECT COUNT(*) FROM QualityTest WHERE BACTERIACOUNT <= 500) AS SafeProducts,
        (SELECT COUNT(*) FROM QualityTest WHERE BACTERIACOUNT > 1000) AS HighRisk
      FROM dual
    `;

    const result = await conn.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    await conn.close();

    res.json({
      passed: result.rows[0].PASSED,
      failed: result.rows[0].FAILED,
      safe: result.rows[0].SAFEPRODUCTS,
      highRisk: result.rows[0].HIGHRISK,
    });
  } catch (err) {
    console.error("❌ /api/dashboard-charts Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   BACKUP AUDIT LOG
   =========================================================== */
app.get("/api/backup-auditlog", async (req, res) => {
  try {
    const conn = await getConnection();
    const sql = `
      SELECT 
        TO_CHAR(Timestamp, 'YYYY-MM-DD HH24:MI') AS Timestamp,
        Action,
        Username
      FROM BackupLog
      ORDER BY Timestamp DESC
    `;

    const result = await conn.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    await conn.close();
    res.json(result.rows);
  } catch (err) {
    console.error("❌ /api/backup-auditlog Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   CREATE BACKUP SNAPSHOT
   =========================================================== */
app.post("/api/create-backup-snapshot", async (req, res) => {
  try {
    const conn = await getConnection();
    const sql = `
      INSERT INTO BackupLog (LogID, Timestamp, Action, Username)
      VALUES (backuplog_seq.NEXTVAL, SYSDATE, 'Backup Created', 'admin')
    `;
    await conn.execute(sql, [], { autoCommit: true });
    await conn.close();

    res.json({ success: true, message: "Backup snapshot recorded" });
  } catch (err) {
    console.error("❌ /api/create-backup-snapshot Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   FULL QUALITY REPORT (ONLY HIGH RISK)
   =========================================================== */
app.get("/api/full-quality-report", async (req, res) => {
  const risk = req.query.risk || "High Risk";

  try {
    const conn = await getConnection();

    const sql = `
      SELECT 
        f.Name AS Food,
        s.Name AS Supplier,
        qt.BACTERIACOUNT AS CFU,
        CASE 
          WHEN qt.BACTERIACOUNT > 1000 THEN 'High Risk'
          WHEN qt.BACTERIACOUNT > 500 THEN 'Moderate Risk'
          ELSE 'Safe'
        END AS Risk,
        qt.RESULT AS Result
      FROM QualityTest qt
      JOIN Batch b ON qt.BatchID = b.BatchID
      JOIN FoodItem f ON b.FoodID = f.FoodID
      JOIN Supplier s ON b.SupplierID = s.SupplierID
      WHERE 
        (CASE 
          WHEN qt.BACTERIACOUNT > 1000 THEN 'High Risk'
          WHEN qt.BACTERIACOUNT > 500 THEN 'Moderate Risk'
          ELSE 'Safe'
        END) = :risk
      ORDER BY qt.BACTERIACOUNT DESC
    `;

    const result = await conn.execute(sql, { risk }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    await conn.close();

    res.json(
      result.rows.map(r => ({
        Food: r.FOOD,
        Supplier: r.SUPPLIER,
        CFU: r.CFU,
        Risk: r.RISK,
        Result: r.RESULT
      }))
    );

  } catch (err) {
    console.error("❌ /api/full-quality-report Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   NEW: FULL QUALITY REPORT (ALL RECORDS)
   =========================================================== */
app.get("/api/all-quality-report", async (req, res) => {
  try {
    const conn = await getConnection();

    const sql = `
      SELECT 
        f.Name AS Food,
        s.Name AS Supplier,
        qt.BACTERIACOUNT AS CFU,
        CASE 
          WHEN qt.BACTERIACOUNT > 1000 THEN 'High Risk'
          WHEN qt.BACTERIACOUNT > 500 THEN 'Moderate Risk'
          ELSE 'Safe'
        END AS Risk,
        qt.RESULT AS Result
      FROM QualityTest qt
      JOIN Batch b ON qt.BatchID = b.BatchID
      JOIN FoodItem f ON b.FoodID = f.FoodID
      JOIN Supplier s ON b.SupplierID = s.SupplierID
      ORDER BY qt.TestDate DESC
    `;

    const result = await conn.execute(sql, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    await conn.close();

    res.json(
      result.rows.map(r => ({
        Food: r.FOOD,
        Supplier: r.SUPPLIER,
        CFU: r.CFU,
        Risk: r.RISK,
        Result: r.RESULT
      }))
    );

  } catch (err) {
    console.error("❌ /api/all-quality-report Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   INSPECTOR API
   =========================================================== */
app.get("/api/inspector", async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(`
      SELECT InspectorID, Name
      FROM Inspector
      ORDER BY InspectorID
    `);

    await conn.close();

    res.json(
      result.rows.map(([InspectorID, Name]) => ({
        InspectorID,
        Name,
      }))
    );
  } catch (err) {
    console.error("❌ GET /api/inspector Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   BATCH API
   =========================================================== */
app.get("/api/batch", async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(`
      SELECT BatchID, FoodID, SupplierID, ManufactureDate,
             ExpiryDate, Quantity, Location, Status
      FROM Batch
      ORDER BY BatchID
    `);

    await conn.close();

    res.json(
      result.rows.map(
        ([
          BatchID,
          FoodID,
          SupplierID,
          ManufactureDate,
          ExpiryDate,
          Quantity,
          Location,
          Status
        ]) => ({
          BatchID,
          FoodID,
          SupplierID,
          ManufactureDate,
          ExpiryDate,
          Quantity,
          Location,
          Status
        })
      )
    );
  } catch (err) {
    console.error("❌ GET /api/batch Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   QUALITY TEST FILTER
   =========================================================== */
app.get("/api/quality-tests", async (req, res) => {
  const { batchId, inspectorName, result, dateFrom, dateTo } = req.query;

  try {
    const conn = await getConnection();
    const where = [];
    const binds = {};

    if (batchId) {
      where.push("qt.BatchID = :batchId");
      binds.batchId = Number(batchId);
    }

    if (inspectorName) {
      where.push("UPPER(i.Name) LIKE '%' || :inspectorName || '%'");
      binds.inspectorName = inspectorName.toUpperCase();
    }

    if (result) {
      where.push("UPPER(qt.RESULT) = :result");
      binds.result = result.toUpperCase();
    }

    if (dateFrom) {
      where.push("qt.TestDate >= TO_DATE(:dateFrom, 'YYYY-MM-DD')");
      binds.dateFrom = dateFrom;
    }

    if (dateTo) {
      where.push("qt.TestDate <= TO_DATE(:dateTo, 'YYYY-MM-DD')");
      binds.dateTo = dateTo;
    }

    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

    const sql = `
      SELECT
        qt.TestID,
        qt.BatchID,
        f.Description AS BatchName,
        i.Name AS Inspector,
        qt.PH,
        qt.MOISTUREPCT,
        qt.BACTERIACOUNT,
        qt.RESULT,
        qt.NOTES,
        TO_CHAR(qt.TestDate, 'YYYY-MM-DD') AS TestDate
      FROM QualityTest qt
      LEFT JOIN Batch ba ON qt.BatchID = ba.BatchID
      LEFT JOIN FoodItem f ON ba.FoodID = f.FoodID
      LEFT JOIN Inspector i ON qt.INSPECTORID = i.INSPECTORID
      ${whereSql}
      ORDER BY qt.TestDate DESC, qt.TestID DESC
    `;

    const resultData = await conn.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    await conn.close();
    res.json(resultData.rows);
  } catch (err) {
    console.error("❌ GET /api/quality-tests Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   RUN QUALITY TEST + AUTO PREDICTION
   =========================================================== */
app.post("/api/run-quality-and-prediction", async (req, res) => {
  const {
    batchId,
    inspectorId = 1,
    ph,
    moisturePct,
    bacteriaCount,
    notes = "Auto test",
  } = req.body || {};

  const phVal = ph ?? randomFloat(5.5, 7.5, 2);
  const moistureVal = moisturePct ?? randomFloat(2, 12, 2);
  const bacteriaVal = bacteriaCount ?? Math.round(randomFloat(100, 900));
  const result = moistureVal > 10 || bacteriaVal > 500 ? "Fail" : "Pass";

  try {
    const conn = await getConnection();

    const insertSql = `
      INSERT INTO QualityTest
        (BATCHID, INSPECTORID, PH, MOISTUREPCT, BACTERIACOUNT, RESULT, NOTES, TESTDATE)
      VALUES
        (:batchId, :inspectorId, :ph, :moisture, :bacteria, :result, :notes, SYSDATE)
      RETURNING TESTID INTO :id
    `;

    const inserted = await conn.execute(
      insertSql,
      {
        batchId,
        inspectorId,
        ph: phVal,
        moisture: moistureVal,
        bacteria: bacteriaVal,
        result,
        notes,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );

    const newId = inserted.outBinds.id[0];

    const fetchSql = `
      SELECT
        q.TESTID,
        q.BATCHID,
        f.Description AS BatchName,
        i.Name AS Inspector,
        q.PH,
        q.MOISTUREPCT,
        q.BACTERIACOUNT,
        q.RESULT,
        q.NOTES,
        TO_CHAR(q.TestDate, 'YYYY-MM-DD') AS TestDate
      FROM QualityTest q
      LEFT JOIN Batch ba ON q.BATCHID = ba.BatchID
      LEFT JOIN FoodItem f ON ba.FoodID = f.FoodID
      LEFT JOIN Inspector i ON q.INSPECTORID = i.INSPECTORID
      WHERE q.TESTID = :tid
    `;

    const newRecord = await conn.execute(
      fetchSql,
      { tid: newId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await conn.close();
    res.json(newRecord.rows[0]);
  } catch (err) {
    console.error("❌ POST /api/run-quality-and-prediction Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   PREDICTION (ML MODEL)
   =========================================================== */
app.post("/api/predict", async (req, res) => {
  try {
    const { temperature, humidity, batchId = null, save = false } = req.body || {};

    if (temperature == null || humidity == null) {
      return res.status(400).json({ error: "temperature and humidity required" });
    }

    const pred = makePrediction(Number(temperature), Number(humidity));

    if (!save) return res.json({ ...pred, Saved: false });

    const conn = await getConnection();

    const insertSql = `
      INSERT INTO Prediction
        (PredictionID, BatchID, Temperature, Humidity, CFU, Risk, CreatedAt)
      VALUES
        (prediction_seq.NEXTVAL, :batchId, :temperature, :humidity, :cfu, :risk, SYSDATE)
      RETURNING PredictionID INTO :pid
    `;

    const binds = {
      batchId: batchId ? Number(batchId) : null,
      temperature: pred.Temperature,
      humidity: pred.Humidity,
      cfu: pred.CFU,
      risk: pred.Risk,
      pid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const info = await conn.execute(insertSql, binds, { autoCommit: true });
    const newPredictionId = info.outBinds.pid[0];

    await conn.close();

    res.json({ ...pred, Saved: true, PredictionID: newPredictionId });
  } catch (err) {
    console.error("❌ Prediction API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   GET SAVED PREDICTIONS
   =========================================================== */
app.get("/api/predictions", async (req, res) => {
  const { batchId, limit = 50 } = req.query;

  try {
    const conn = await getConnection();
    const lim = Number(limit) || 50;

    let baseSql = `
      SELECT
        PredictionID,
        BatchID,
        Temperature,
        Humidity,
        CFU,
        Risk,
        TO_CHAR(CreatedAt, 'YYYY-MM-DD HH24:MI:SS') AS CreatedAt
      FROM Prediction
    `;

    const binds = {};

    if (batchId) {
      baseSql += ` WHERE BatchID = :batchId`;
      binds.batchId = Number(batchId);
    }

    const finalSql = `
      SELECT * FROM (
        ${baseSql}
        ORDER BY CreatedAt DESC
      ) WHERE ROWNUM <= ${lim}
    `;

    const result = await conn.execute(finalSql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    await conn.close();
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET /api/predictions Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===========================================================
   HELPER
   =========================================================== */
function randomFloat(min, max, decimals = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

/* ===========================================================
   SERVER START
   =========================================================== */
app.get("/", (req, res) => {
  res.send("✅ EatSafe backend API is running properly.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
