-------------------------------------------------------------
-- TEAMMATE 2: Constraints, Views, and Queries (50–60%)
-------------------------------------------------------------

-- 1️⃣ Add Constraints
ALTER TABLE FoodItem ADD CONSTRAINT chk_food_name CHECK (Name IS NOT NULL);
ALTER TABLE Supplier ADD CONSTRAINT chk_supplier_email CHECK (ContactEmail LIKE '%@%.%');
ALTER TABLE Batch ADD CONSTRAINT chk_valid_dates CHECK (ExpiryDate > ManufactureDate);
ALTER TABLE QualityTest ADD CONSTRAINT chk_ph_range CHECK (pH BETWEEN 0 AND 14);
ALTER TABLE QualityTest ADD CONSTRAINT chk_result CHECK (Result IN ('Pass', 'Fail'));

-------------------------------------------------------------
-- 2️⃣ Create Useful Views
-------------------------------------------------------------

-- View 1: Food batches with their expiry status
CREATE OR REPLACE VIEW FoodBatchStatus AS
SELECT 
    f.Name AS FoodName,
    b.BatchID,
    b.ManufactureDate,
    b.ExpiryDate,
    CASE 
        WHEN b.ExpiryDate < SYSDATE THEN 'Expired'
        ELSE 'Fresh'
    END AS Status
FROM Batch b
JOIN FoodItem f ON b.FoodID = f.FoodID;

-- View 2: Supplier-wise total batches supplied
CREATE OR REPLACE VIEW SupplierBatchSummary AS
SELECT 
    s.Name AS SupplierName,
    COUNT(b.BatchID) AS TotalBatches,
    MIN(b.ManufactureDate) AS FirstSupply,
    MAX(b.ExpiryDate) AS LatestExpiry
FROM Supplier s
LEFT JOIN Batch b ON s.SupplierID = b.SupplierID
GROUP BY s.Name;

-------------------------------------------------------------
-- 3️⃣ Analytical Queries
-------------------------------------------------------------

PROMPT ====== QUERY 1: Expired Batches ======
SELECT * FROM FoodBatchStatus WHERE Status = 'Expired';

PROMPT ====== QUERY 2: Supplier Batch Summary ======
SELECT * FROM SupplierBatchSummary;

PROMPT ====== QUERY 3: Average pH per Food Type ======
SELECT f.Name, ROUND(AVG(q.pH), 2) AS Avg_pH
FROM FoodItem f
JOIN Batch b ON f.FoodID = b.FoodID
JOIN QualityTest q ON b.BatchID = q.BatchID
GROUP BY f.Name;

PROMPT ====== QUERY 4: Count of Passed vs Failed Tests ======
SELECT Result, COUNT(*) AS Count
FROM QualityTest
GROUP BY Result;

-------------------------------------------------------------
-- 4️⃣ Simple Validation Trigger (partial implementation)
-------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_check_expiry
BEFORE INSERT OR UPDATE ON Batch
FOR EACH ROW
BEGIN
    IF :NEW.ExpiryDate <= :NEW.ManufactureDate THEN
        RAISE_APPLICATION_ERROR(-20001, 'Expiry Date must be after Manufacture Date');
    END IF;
END;
/

-------------------------------------------------------------
-- 5️⃣ Run View and Trigger Verification
-------------------------------------------------------------
PROMPT ====== VERIFYING CREATED VIEWS ======
SELECT * FROM FoodBatchStatus;
SELECT * FROM SupplierBatchSummary;

PROMPT ====== TRYING TO INSERT INVALID BATCH (Should FAIL) ======
BEGIN
    INSERT INTO Batch VALUES (batch_seq.NEXTVAL, 1, 1, TO_DATE('2025-12-10', 'YYYY-MM-DD'), TO_DATE('2025-11-10', 'YYYY-MM-DD'), 400, 'InvalidTest');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error Caught: ' || SQLERRM);
END;
/
