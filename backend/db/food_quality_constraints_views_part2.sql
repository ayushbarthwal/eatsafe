-------------------------------------------------------------
-- TEAMMATE 2: Integrity, Advanced Views & Analytical Queries
-- Final Phase (Fully Updated – 100% Stable)
-------------------------------------------------------------

SET SERVEROUTPUT ON;

-------------------------------------------------------------
-- 0️⃣ SAFE DROP EXISTING CONSTRAINTS (Avoid duplication errors)
-------------------------------------------------------------
BEGIN
  FOR r IN (
    SELECT constraint_name, table_name FROM user_constraints
    WHERE constraint_type = 'C'
      AND constraint_name IN (
        'CHK_FOOD_NAME','CHK_SUPPLIER_EMAIL','CHK_VALID_DATES',
        'CHK_PH_RANGE','CHK_RESULT','CHK_HUMIDITY','CHK_TEMPERATURE'
      )
  ) LOOP
    EXECUTE IMMEDIATE 'ALTER TABLE '||r.table_name||' DROP CONSTRAINT '||r.constraint_name;
  END LOOP;
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
-------------------------------------------------------------
-- 1️⃣ Add or Enhance Constraints
-------------------------------------------------------------
ALTER TABLE FoodItem ADD CONSTRAINT CHK_FOOD_NAME CHECK (Name IS NOT NULL);
ALTER TABLE Supplier ADD CONSTRAINT CHK_SUPPLIER_EMAIL CHECK (ContactEmail LIKE '%@%.%');
ALTER TABLE Batch ADD CONSTRAINT CHK_VALID_DATES CHECK (ExpiryDate > ManufactureDate);
ALTER TABLE QualityTest ADD CONSTRAINT CHK_PH_RANGE CHECK (pH BETWEEN 0 AND 14);
ALTER TABLE QualityTest ADD CONSTRAINT CHK_RESULT CHECK (Result IN ('Pass','Fail'));
ALTER TABLE MicrobePrediction ADD CONSTRAINT CHK_HUMIDITY CHECK (Humidity BETWEEN 0 AND 100);
ALTER TABLE MicrobePrediction ADD CONSTRAINT CHK_TEMPERATURE CHECK (Temperature BETWEEN 0 AND 50);

PROMPT ✅ All Integrity Constraints Added Successfully.

-------------------------------------------------------------
-- 2️⃣ Triggers for Validation & Automation
-------------------------------------------------------------

-- Trigger 1: Validate Expiry Date
CREATE OR REPLACE TRIGGER trg_check_expiry
BEFORE INSERT OR UPDATE ON Batch
FOR EACH ROW
BEGIN
    IF :NEW.ExpiryDate <= :NEW.ManufactureDate THEN
        RAISE_APPLICATION_ERROR(-20001, '❌ Expiry Date must be after Manufacture Date');
    END IF;
END;
/
PROMPT ✅ Trigger trg_check_expiry Created.

-- Trigger 2: Auto-update Result Label if values exceed threshold
CREATE OR REPLACE TRIGGER trg_auto_result
BEFORE INSERT OR UPDATE ON QualityTest
FOR EACH ROW
BEGIN
    IF :NEW.BacteriaCount > 800 OR :NEW.MoisturePct > 10 THEN
        :NEW.Result := 'Fail';
    ELSE
        :NEW.Result := 'Pass';
    END IF;
END;
/
PROMPT ✅ Trigger trg_auto_result Created.

-- Trigger 3: Auto-risk detection based on CFU prediction
CREATE OR REPLACE TRIGGER trg_microbe_risk
BEFORE INSERT OR UPDATE ON MicrobePrediction
FOR EACH ROW
BEGIN
    IF :NEW.PredictedCFU > 1000 THEN
        DBMS_OUTPUT.PUT_LINE('⚠️ High Risk Predicted for Batch ID: ' || :NEW.BatchID);
    ELSE
        DBMS_OUTPUT.PUT_LINE('✅ Safe Microbial Level for Batch ID: ' || :NEW.BatchID);
    END IF;
END;
/
PROMPT ✅ Trigger trg_microbe_risk Created.

-------------------------------------------------------------
-- 3️⃣ Create Advanced Views
-------------------------------------------------------------

-- View 1: Food Batch Status with Expiry & Prediction Integration
CREATE OR REPLACE VIEW FoodBatchStatus AS
SELECT 
    f.Name AS FoodName,
    f.Category,
    b.BatchID,
    b.ManufactureDate,
    b.ExpiryDate,
    CASE 
        WHEN b.ExpiryDate < SYSDATE THEN 'Expired'
        ELSE 'Fresh'
    END AS Status,
    NVL(m.PredictedCFU, 0) AS PredictedCFU,
    CASE 
        WHEN NVL(m.PredictedCFU, 0) > 1000 THEN 'High Risk'
        ELSE 'Safe'
    END AS PredictedStatus
FROM Batch b
JOIN FoodItem f ON b.FoodID = f.FoodID
LEFT JOIN MicrobePrediction m ON b.BatchID = m.BatchID;
PROMPT ✅ View FoodBatchStatus Created.

-- View 2: Supplier Performance Summary (safe division)
CREATE OR REPLACE VIEW SupplierPerformance AS
SELECT 
    s.Name AS SupplierName,
    COUNT(DISTINCT b.BatchID) AS TotalBatches,
    SUM(CASE WHEN q.Result = 'Pass' THEN 1 ELSE 0 END) AS PassedTests,
    SUM(CASE WHEN q.Result = 'Fail' THEN 1 ELSE 0 END) AS FailedTests,
    ROUND(
        CASE 
            WHEN NVL(COUNT(q.TestID),0) = 0 THEN 0
            ELSE (SUM(CASE WHEN q.Result = 'Pass' THEN 1 ELSE 0 END) / 
                  NULLIF(COUNT(q.TestID),0)) * 100
        END
    ,2) AS SuccessRate
FROM Supplier s
LEFT JOIN Batch b ON s.SupplierID = b.SupplierID
LEFT JOIN QualityTest q ON b.BatchID = q.BatchID
GROUP BY s.Name;
PROMPT ✅ View SupplierPerformance Created.

-- View 3: Category-Wise Quality Insights
CREATE OR REPLACE VIEW CategoryQualityReport AS
SELECT 
    f.Category,
    ROUND(AVG(q.pH),2) AS Avg_pH,
    ROUND(AVG(q.MoisturePct),2) AS Avg_Moisture,
    ROUND(AVG(m.PredictedCFU),2) AS Avg_CFU,
    SUM(CASE WHEN q.Result='Pass' THEN 1 ELSE 0 END) AS PassedItems,
    SUM(CASE WHEN q.Result='Fail' THEN 1 ELSE 0 END) AS FailedItems
FROM FoodItem f
JOIN Batch b ON f.FoodID = b.FoodID
JOIN QualityTest q ON b.BatchID = q.BatchID
LEFT JOIN MicrobePrediction m ON b.BatchID = m.BatchID
GROUP BY f.Category;
PROMPT ✅ View CategoryQualityReport Created.

-------------------------------------------------------------
-- 4️⃣ Analytical Queries (For Final Report)
-------------------------------------------------------------
PROMPT ====== QUERY 1: Show Expired or High-Risk Food Batches ======
SELECT FoodName, Status, PredictedStatus, PredictedCFU
FROM FoodBatchStatus
WHERE Status='Expired' OR PredictedStatus='High Risk';

PROMPT ====== QUERY 2: Supplier Performance Summary ======
SELECT * FROM SupplierPerformance;

PROMPT ====== QUERY 3: Average pH, Moisture, CFU by Category ======
SELECT * FROM CategoryQualityReport;

PROMPT ====== QUERY 4: Passed vs Failed Test Counts ======
SELECT Result, COUNT(*) AS Count FROM QualityTest GROUP BY Result;

PROMPT ====== QUERY 5: High CFU Alerts ======
SELECT f.Name, m.PredictedCFU, m.MethodUsed 
FROM MicrobePrediction m
JOIN Batch b ON m.BatchID = b.BatchID
JOIN FoodItem f ON b.FoodID = f.FoodID
WHERE m.PredictedCFU > 1000;

-------------------------------------------------------------
-- 5️⃣ Index Creation for Performance
-------------------------------------------------------------
CREATE INDEX idx_batch_expiry ON Batch(ExpiryDate);
CREATE INDEX idx_microbe_batch ON MicrobePrediction(BatchID);
CREATE INDEX idx_qresult_batch ON QualityTest(BatchID);
PROMPT ✅ Indexes Created for Faster Query Execution.

-------------------------------------------------------------
-- 6️⃣ Validation Tests (Trigger & Constraint Testing)
-------------------------------------------------------------
PROMPT ====== TEST 1: TRY INVALID BATCH (Expiry < Manufacture) ======
BEGIN
    INSERT INTO Batch VALUES (
        batch_seq.NEXTVAL, 1, 1,
        TO_DATE('2025-11-01','YYYY-MM-DD'),
        TO_DATE('2025-10-01','YYYY-MM-DD'),
        400, 'InvalidTest'
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/

PROMPT ====== TEST 2: INSERT PREDICTION RECORD TO TRIGGER OUTPUT ======
BEGIN
    INSERT INTO MicrobePrediction VALUES (
        microbe_seq.NEXTVAL, 2, 28.5, 75.0, 1300, SYSDATE, 'Baranyi'
    );
END;
/

PROMPT ====== TEST 3: CHECK CREATED VIEWS ======
SELECT * FROM FoodBatchStatus;
SELECT * FROM SupplierPerformance;
SELECT * FROM CategoryQualityReport;

PROMPT ✅ TEAMMATE 2 FINAL PHASE EXECUTION COMPLETE.
/
