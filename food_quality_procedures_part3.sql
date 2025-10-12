-------------------------------------------------------------
-- TEAMMATE 3: Stored Procedures, Functions, and Indexes (50–60%)
-------------------------------------------------------------

SET SERVEROUTPUT ON;

-------------------------------------------------------------
-- 1️⃣ Index Creation (For Performance Improvement)
-------------------------------------------------------------
CREATE INDEX idx_food_name ON FoodItem(Name);
CREATE INDEX idx_supplier_name ON Supplier(Name);
CREATE INDEX idx_batch_food ON Batch(FoodID);
CREATE INDEX idx_quality_result ON QualityTest(Result);

PROMPT ====== INDEXES CREATED SUCCESSFULLY ======


-------------------------------------------------------------
-- 2️⃣ Stored Procedure: Insert a New Food Batch Safely
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
        RAISE_APPLICATION_ERROR(-20010, 'Expiry date must be after manufacture date.');
    END IF;

    INSERT INTO Batch (BatchID, FoodID, SupplierID, ManufactureDate, ExpiryDate, Quantity, Location)
    VALUES (batch_seq.NEXTVAL, p_FoodID, p_SupplierID, p_ManufactureDate, p_ExpiryDate, p_Quantity, p_Location);

    DBMS_OUTPUT.PUT_LINE('New batch inserted successfully.');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error inserting batch: ' || SQLERRM);
END;
/

PROMPT ====== STORED PROCEDURE CREATED ======


-------------------------------------------------------------
-- 3️⃣ Stored Procedure: Display All Failed Quality Tests
-------------------------------------------------------------
CREATE OR REPLACE PROCEDURE ShowFailedBatches
IS
BEGIN
    DBMS_OUTPUT.PUT_LINE('===== FAILED QUALITY TESTS =====');
    FOR rec IN (
        SELECT f.Name AS FoodName, q.Result, q.Notes, b.ExpiryDate
        FROM FoodItem f
        JOIN Batch b ON f.FoodID = b.FoodID
        JOIN QualityTest q ON b.BatchID = q.BatchID
        WHERE q.Result = 'Fail'
    )
    LOOP
        DBMS_OUTPUT.PUT_LINE('Food: ' || rec.FoodName || ' | Result: ' || rec.Result || 
                             ' | Notes: ' || rec.Notes || ' | Expiry: ' || rec.ExpiryDate);
    END LOOP;
END;
/

PROMPT ====== PROCEDURE TO SHOW FAILED TESTS CREATED ======


-------------------------------------------------------------
-- 4️⃣ Function: Check Food Quality Result (Pass/Fail)
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

PROMPT ====== FUNCTION CREATED SUCCESSFULLY ======


-------------------------------------------------------------
-- 5️⃣ Test the Stored Procedure and Function
-------------------------------------------------------------
PROMPT ====== TEST 1: CALL AddNewBatch (Valid Entry) ======
BEGIN
    AddNewBatch(1, 1, TO_DATE('2025-10-10', 'YYYY-MM-DD'), TO_DATE('2025-11-10', 'YYYY-MM-DD'), 250, 'Surat');
END;
/

PROMPT ====== TEST 2: CALL AddNewBatch (Invalid Entry - Expect Error) ======
BEGIN
    AddNewBatch(2, 2, TO_DATE('2025-12-05', 'YYYY-MM-DD'), TO_DATE('2025-11-05', 'YYYY-MM-DD'), 100, 'Mumbai');
END;
/

PROMPT ====== TEST 3: CALL ShowFailedBatches ======
BEGIN
    ShowFailedBatches;
END;
/

PROMPT ====== TEST 4: CALL GetFoodQualityStatus FUNCTION ======
DECLARE
    v_result VARCHAR2(10);
BEGIN
    v_result := GetFoodQualityStatus('Bread');
    DBMS_OUTPUT.PUT_LINE('Bread Quality Status: ' || v_result);
END;
/

-------------------------------------------------------------
-- 6️⃣ Verify Index Effect (Query Performance)
-------------------------------------------------------------
PROMPT ====== PERFORMANCE TEST QUERY ======
SELECT /*+ INDEX(F idx_food_name) */ f.Name, q.Result
FROM FoodItem f
JOIN Batch b ON f.FoodID = b.FoodID
JOIN QualityTest q ON b.BatchID = q.BatchID;
/
