-- ===============================
-- TEAMMATE 4 – FINAL PHASE SCRIPT
-- Focus: Transactions, Reports, Backup
-- ===============================

PROMPT ====== STARTING TEAMMATE 4 PHASE ======

-- 1️⃣  TRANSACTION CONTROL DEMONSTRATION
PROMPT ====== TRANSACTION CONTROL TEST ======
BEGIN
    SAVEPOINT before_insert;

    INSERT INTO FoodItem (FoodID, Name, Category, Description)
    VALUES (food_seq.NEXTVAL, 'Cheese', 'Dairy', 'Processed cheese sample');

    INSERT INTO Supplier (SupplierID, Name, ContactEmail, ContactPhone, Address)
    VALUES (supplier_seq.NEXTVAL, 'Nestle India', 'contact@nestle.in', '9990001111', 'Delhi');

    INSERT INTO Batch (BatchID, FoodID, SupplierID, ManufactureDate, ExpiryDate, Quantity, Location)
    VALUES (batch_seq.NEXTVAL, 4, 4, TO_DATE('10-OCT-25','DD-MON-YY'), TO_DATE('10-DEC-25','DD-MON-YY'), 400, 'Delhi Plant');

    COMMIT;

    DBMS_OUTPUT.PUT_LINE('✅ Transaction committed successfully.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO before_insert;
        DBMS_OUTPUT.PUT_LINE('❌ Error detected — transaction rolled back.');
END;
/

-- 2️⃣  COMPLEX JOIN REPORT
PROMPT ====== QUALITY TEST SUMMARY REPORT ======
SELECT f.Name AS FoodName,
       s.Name AS SupplierName,
       q.Result,
       q.Notes,
       b.Location,
       b.ManufactureDate,
       b.ExpiryDate
FROM   FoodItem f
       JOIN Batch b ON f.FoodID = b.FoodID
       JOIN Supplier s ON s.SupplierID = b.SupplierID
       JOIN QualityTest q ON q.BatchID = b.BatchID
ORDER BY f.Name;

-- 3️⃣  BACKUP VIEW FOR REPORTING
PROMPT ====== CREATING BACKUP SUMMARY VIEW ======
CREATE OR REPLACE VIEW FoodQuality_Backup AS
SELECT f.Name AS FoodName,
       s.Name AS SupplierName,
       q.Result,
       q.Notes,
       b.ExpiryDate
FROM   FoodItem f
       JOIN Batch b ON f.FoodID = b.FoodID
       JOIN Supplier s ON s.SupplierID = b.SupplierID
       JOIN QualityTest q ON q.BatchID = b.BatchID;

PROMPT View Created Successfully: FoodQuality_Backup

-- 4️⃣  QUERY BACKUP VIEW
PROMPT ====== BACKUP SUMMARY VIEW CONTENT ======
SELECT * FROM FoodQuality_Backup;

-- 5️⃣  ANALYTICAL QUERY – CATEGORY WISE TEST STATUS
PROMPT ====== CATEGORY-WISE TEST SUMMARY ======
SELECT f.Category,
       COUNT(*) AS TotalTests,
       SUM(CASE WHEN q.Result='Pass' THEN 1 ELSE 0 END) AS Passed,
       SUM(CASE WHEN q.Result='Fail' THEN 1 ELSE 0 END) AS Failed
FROM   FoodItem f
       JOIN Batch b ON f.FoodID = b.FoodID
       JOIN QualityTest q ON q.BatchID = b.BatchID
GROUP BY f.Category;

-- 6️⃣  TEST TRANSACTION ROLLBACK (DEMO)
PROMPT ====== TRANSACTION ROLLBACK DEMO ======
BEGIN
    SAVEPOINT before_delete;

    DELETE FROM QualityTest WHERE Result='Fail';
    DBMS_OUTPUT.PUT_LINE('Temporarily deleted failed tests...');
    ROLLBACK TO before_delete;
    DBMS_OUTPUT.PUT_LINE('Rollback successful — no data lost.');
END;
/

PROMPT ====== TEAMMATE 4 PHASE EXECUTION COMPLETE ======
