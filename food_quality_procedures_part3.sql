-------------------------------------------------------------
-- TEAMMATE 3: Stored Procedures, Functions & Indexing
-- FINAL PHASE (100%)
-------------------------------------------------------------

SET SERVEROUTPUT ON;

-------------------------------------------------------------
-- 1️⃣ Index Creation (Performance Optimization)
-------------------------------------------------------------
CREATE INDEX idx_food_name ON FoodItem(Name);
CREATE INDEX idx_supplier_name ON Supplier(Name);
CREATE INDEX idx_batch_food ON Batch(FoodID);
CREATE INDEX idx_quality_result ON QualityTest(Result);
CREATE INDEX idx_prediction_cfu ON MicrobePrediction(PredictedCFU);

-- 🔹 Optional Optimization Indexes (For Faster Joins)
CREATE INDEX idx_batch_supplier ON Batch(SupplierID);
CREATE INDEX idx_quality_batchid ON QualityTest(BatchID);

PROMPT ====== ✅ INDEXES CREATED SUCCESSFULLY ======


-------------------------------------------------------------
-- 2️⃣ Stored Procedure: Safely Insert a New Food Batch
-------------------------------------------------------------
CREATE OR REPLACE PROCEDURE AddNewBatch(
    p_FoodID IN NUMBER,
    p_SupplierID IN NUMBER,
    p_ManufactureDate IN DATE,
    p_ExpiryDate IN DATE,
    p_Quantity IN NUMBER,
    p_Location IN VARCHAR2
)
IS
BEGIN
    IF p_ExpiryDate <= p_ManufactureDate THEN
        RAISE_APPLICATION_ERROR(-20010, '❌ Expiry date must be after manufacture date.');
    END IF;

    INSERT INTO Batch (BatchID, FoodID, SupplierID, ManufactureDate, ExpiryDate, Quantity, Location)
    VALUES (batch_seq.NEXTVAL, p_FoodID, p_SupplierID, p_ManufactureDate, p_ExpiryDate, p_Quantity, p_Location);

    DBMS_OUTPUT.PUT_LINE('✅ New batch inserted successfully.');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('⚠️ Error inserting batch: ' || SQLERRM);
END;
/
PROMPT ====== AddNewBatch Procedure Created ======


-------------------------------------------------------------
-- 3️⃣ Stored Procedure: Auto-Test Batch & Predict CFU
-------------------------------------------------------------
CREATE OR REPLACE PROCEDURE RunQualityAndPrediction(
    p_BatchID IN NUMBER,
    p_InspectorID IN NUMBER,
    p_Temperature IN NUMBER,
    p_Humidity IN NUMBER,
    p_MethodUsed IN VARCHAR2
)
IS
    v_pH NUMBER := ROUND(DBMS_RANDOM.VALUE(5.0, 7.5), 2);
    v_Moisture NUMBER := ROUND(DBMS_RANDOM.VALUE(2.0, 15.0), 2);
    v_Bacteria NUMBER := ROUND(DBMS_RANDOM.VALUE(100, 1200));
    v_Result VARCHAR2(10);
    v_PredCFU NUMBER;
BEGIN
    -- Determine Pass/Fail
    IF v_Bacteria > 800 OR v_Moisture > 10 THEN
        v_Result := 'Fail';
    ELSE
        v_Result := 'Pass';
    END IF;

    -- Insert Quality Test
    INSERT INTO QualityTest VALUES (test_seq.NEXTVAL, p_BatchID, p_InspectorID, v_pH, v_Moisture, v_Bacteria, v_Result, 'Auto test via RunQualityAndPrediction');

    -- Predict CFU using simplified Baranyi Model
    v_PredCFU := ROUND((v_Bacteria * (1 + (p_Temperature/30)) * (p_Humidity/70)), 2);

    INSERT INTO MicrobePrediction VALUES (microbe_seq.NEXTVAL, p_BatchID, p_Temperature, p_Humidity, v_PredCFU, SYSDATE, p_MethodUsed);

    DBMS_OUTPUT.PUT_LINE('✅ Quality Test Added | Result: ' || v_Result);
    DBMS_OUTPUT.PUT_LINE('🧫 Predicted CFU: ' || v_PredCFU);
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('⚠️ Error in RunQualityAndPrediction: ' || SQLERRM);
END;
/
PROMPT ====== RunQualityAndPrediction Procedure Created ======


-------------------------------------------------------------
-- 4️⃣ Stored Procedure: Display Failed or Risky Batches
-------------------------------------------------------------
CREATE OR REPLACE PROCEDURE ShowFailedOrRiskyBatches
IS
BEGIN
    DBMS_OUTPUT.PUT_LINE('===== FAILED OR HIGH RISK BATCHES =====');
    FOR rec IN (
        SELECT f.Name AS FoodName, q.Result, q.Notes, m.PredictedCFU, b.ExpiryDate
        FROM FoodItem f
        JOIN Batch b ON f.FoodID = b.FoodID
        JOIN QualityTest q ON b.BatchID = q.BatchID
        LEFT JOIN MicrobePrediction m ON b.BatchID = m.BatchID
        WHERE q.Result = 'Fail' OR NVL(m.PredictedCFU,0) > 1000
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE('❌ Food: ' || rec.FoodName || 
                             ' | Result: ' || rec.Result ||
                             ' | CFU: ' || rec.PredictedCFU || 
                             ' | Expiry: ' || rec.ExpiryDate);
    END LOOP;
END;
/
PROMPT ====== ShowFailedOrRiskyBatches Procedure Created ======


-------------------------------------------------------------
-- 5️⃣ Function: Get Food Quality Status (Pass/Fail)
-------------------------------------------------------------
CREATE OR REPLACE FUNCTION GetFoodQualityStatus(p_FoodName IN VARCHAR2)
RETURN VARCHAR2
IS
    v_status VARCHAR2(10);
BEGIN
    SELECT CASE
            WHEN AVG(q.pH) BETWEEN 6 AND 8 AND AVG(q.BacteriaCount) < 500 THEN 'Pass'
            ELSE 'Fail'
           END
    INTO v_status
    FROM FoodItem f
    JOIN Batch b ON f.FoodID = b.FoodID
    JOIN QualityTest q ON b.BatchID = q.BatchID
    WHERE LOWER(f.Name) = LOWER(p_FoodName);

    RETURN v_status;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'No Record';
END;
/
PROMPT ====== Function GetFoodQualityStatus Created ======


-------------------------------------------------------------
-- 6️⃣ SAFER Function: Supplier Reliability Score (0–100%)
-------------------------------------------------------------
CREATE OR REPLACE FUNCTION GetSupplierReliability(p_SupplierName IN VARCHAR2)
RETURN NUMBER
IS
    v_score NUMBER;
BEGIN
    SELECT ROUND(
             (SUM(CASE WHEN q.Result='Pass' THEN 1 ELSE 0 END) /
              NULLIF(COUNT(*),0)) * 100, 2)
    INTO v_score
    FROM Supplier s
    JOIN Batch b ON s.SupplierID = b.SupplierID
    JOIN QualityTest q ON b.BatchID = q.BatchID
    WHERE LOWER(s.Name) = LOWER(p_SupplierName);

    RETURN v_score;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END;
/
PROMPT ✅ Function GetSupplierReliability (Safe Version) Created ======


-------------------------------------------------------------
-- 7️⃣ Testing Stored Procedures and Functions
-------------------------------------------------------------
PROMPT ====== TEST 1: CALL AddNewBatch ======
BEGIN
    AddNewBatch(1, 1, TO_DATE('2025-11-05','YYYY-MM-DD'), TO_DATE('2025-12-05','YYYY-MM-DD'), 300, 'Surat');
END;
/

PROMPT ====== TEST 2: CALL RunQualityAndPrediction ======
BEGIN
    RunQualityAndPrediction(1, 1, 27.5, 70.0, 'Baranyi');
END;
/

PROMPT ====== TEST 3: CALL ShowFailedOrRiskyBatches ======
BEGIN
    ShowFailedOrRiskyBatches;
END;
/

PROMPT ====== TEST 4: CALL GetFoodQualityStatus ======
DECLARE
    v_result VARCHAR2(10);
BEGIN
    v_result := GetFoodQualityStatus('Milk');
    DBMS_OUTPUT.PUT_LINE('🧾 Milk Quality Status: ' || v_result);
END;
/

PROMPT ====== TEST 5: CALL GetSupplierReliability ======
DECLARE
    v_score NUMBER;
BEGIN
    v_score := GetSupplierReliability('Amul Pvt Ltd');
    DBMS_OUTPUT.PUT_LINE('🏭 Amul Supplier Reliability Score: ' || v_score || '%');
END;
/

PROMPT ====== TEST 6: INDEX PERFORMANCE CHECK ======
SELECT /*+ INDEX(Q idx_quality_result) */ f.Name, q.Result, m.PredictedCFU
FROM FoodItem f
JOIN Batch b ON f.FoodID = b.FoodID
JOIN QualityTest q ON b.BatchID = q.BatchID
LEFT JOIN MicrobePrediction m ON b.BatchID = m.BatchID;
/
