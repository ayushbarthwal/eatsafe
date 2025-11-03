-- ===============================
-- TEAMMATE 4 – FINAL PHASE SCRIPT
-- Focus: Transactions, Reports, Backup, Predictive Integration
-- ===============================

SET SERVEROUTPUT ON;
SET LINESIZE 250;
SET PAGESIZE 50;
SET WRAP OFF;

COLUMN FoodName FORMAT A15;
COLUMN SupplierName FORMAT A20;
COLUMN Result FORMAT A10;
COLUMN Notes FORMAT A25;
COLUMN PredictedCFU FORMAT 999999.99;
COLUMN ExpiryDate FORMAT A12;

PROMPT ====== STARTING TEAMMATE 4 FINAL PHASE ======

-------------------------------------------------------------
-- 1️⃣ TRANSACTION CONTROL WITH SAVEPOINTS
-------------------------------------------------------------
PROMPT ====== TRANSACTION CONTROL TEST ======
BEGIN
    SAVEPOINT before_insert;

    INSERT INTO FoodItem (FoodID, Name, Category, Description)
    VALUES (food_seq.NEXTVAL, 'Butter', 'Dairy', 'Unsalted butter block');

    INSERT INTO Supplier (SupplierID, Name, ContactEmail, ContactPhone, Address)
    VALUES (supplier_seq.NEXTVAL, 'Mother Dairy Pvt Ltd', 'info@motherdairy.in', '9901122334', 'Noida, UP');

    -- Minor Fix #2: Use latest sequence values to link correctly
    INSERT INTO Batch (BatchID, FoodID, SupplierID, ManufactureDate, ExpiryDate, Quantity, Location)
    VALUES (batch_seq.NEXTVAL, food_seq.CURRVAL, supplier_seq.CURRVAL,
            TO_DATE('01-NOV-25','DD-MON-YY'), TO_DATE('01-JAN-26','DD-MON-YY'),
            600, 'Noida Plant');

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('✅ Transaction committed successfully — records added.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO before_insert;
        DBMS_OUTPUT.PUT_LINE('❌ Error detected — transaction rolled back safely.');
END;
/

-------------------------------------------------------------
-- 2️⃣ COMPLEX JOIN REPORT WITH PREDICTIVE DATA
-------------------------------------------------------------
PROMPT ====== QUALITY & PREDICTION SUMMARY REPORT ======
SELECT f.Name AS FoodName,
       s.Name AS SupplierName,
       q.Result,
       q.Notes,
       NVL(m.PredictedCFU,0) AS Predicted_CFU,
       b.Location,
       b.ManufactureDate,
       b.ExpiryDate
FROM   FoodItem f
       JOIN Batch b ON f.FoodID = b.FoodID
       JOIN Supplier s ON s.SupplierID = b.SupplierID
       LEFT JOIN QualityTest q ON q.BatchID = b.BatchID
       LEFT JOIN MicrobePrediction m ON b.BatchID = m.BatchID
ORDER BY f.Name;

-------------------------------------------------------------
-- 3️⃣ BACKUP SNAPSHOT VIEW FOR REPORTING
-------------------------------------------------------------
PROMPT ====== CREATING BACKUP SUMMARY VIEW ======
CREATE OR REPLACE VIEW FoodQuality_Backup AS
SELECT f.Name AS FoodName,
       s.Name AS SupplierName,
       q.Result,
       q.Notes,
       NVL(m.PredictedCFU,0) AS PredictedCFU,
       b.ExpiryDate
FROM   FoodItem f
       JOIN Batch b ON f.FoodID = b.FoodID
       JOIN Supplier s ON s.SupplierID = b.SupplierID
       LEFT JOIN QualityTest q ON q.BatchID = b.BatchID
       LEFT JOIN MicrobePrediction m ON m.BatchID = b.BatchID;

PROMPT ✅ View Created Successfully: FoodQuality_Backup
/

-------------------------------------------------------------
-- 4️⃣ QUERY BACKUP VIEW (SNAPSHOT VERIFICATION)
-------------------------------------------------------------
PROMPT ====== BACKUP SUMMARY VIEW CONTENT ======
SELECT * FROM FoodQuality_Backup;
/

-------------------------------------------------------------
-- 5️⃣ CATEGORY-WISE TEST & PREDICTION SUMMARY
-------------------------------------------------------------
PROMPT ====== CATEGORY-WISE QUALITY & RISK SUMMARY ======
SELECT f.Category,
       COUNT(*) AS TotalTests,
       SUM(CASE WHEN q.Result='Pass' THEN 1 ELSE 0 END) AS Passed,
       SUM(CASE WHEN q.Result='Fail' THEN 1 ELSE 0 END) AS Failed,
       ROUND(AVG(NVL(m.PredictedCFU,0)),2) AS AvgPredictedCFU
FROM   FoodItem f
       JOIN Batch b ON f.FoodID = b.FoodID
       LEFT JOIN QualityTest q ON b.BatchID = q.BatchID
       LEFT JOIN MicrobePrediction m ON b.BatchID = m.BatchID
GROUP BY f.Category;
/

-------------------------------------------------------------
-- 6️⃣ TRANSACTION ROLLBACK (DEMO)
-------------------------------------------------------------
PROMPT ====== TRANSACTION ROLLBACK DEMONSTRATION ======
BEGIN
    SAVEPOINT before_delete;

    DELETE FROM QualityTest WHERE Result='Fail';
    DBMS_OUTPUT.PUT_LINE('⚠️ Temporarily deleted failed tests for demonstration.');

    ROLLBACK TO before_delete;
    DBMS_OUTPUT.PUT_LINE('✅ Rollback successful — data restored successfully.');
END;
/

-------------------------------------------------------------
-- 6️⃣.1 MINOR FIX #1: CREATE BACKUP AUDIT LOG TABLE & SEQUENCE
-------------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Backup_AuditLog CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

CREATE TABLE Backup_AuditLog (
    AuditID NUMBER PRIMARY KEY,
    LogDate DATE DEFAULT SYSDATE,
    Description VARCHAR2(200)
);

CREATE SEQUENCE audit_seq START WITH 1 INCREMENT BY 1;
PROMPT ✅ Backup_AuditLog table and sequence created successfully
/

-------------------------------------------------------------
-- 7️⃣ AUTOMATED BACKUP INSERT (SIMULATED SNAPSHOT)
-------------------------------------------------------------
PROMPT ====== AUTOMATED BACKUP INSERT TEST ======
BEGIN
    INSERT INTO Backup_AuditLog
    VALUES (audit_seq.NEXTVAL, SYSDATE, 'Automated backup snapshot created from FoodQuality_Backup');
    DBMS_OUTPUT.PUT_LINE('🗂️ Backup audit log recorded successfully.');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('⚠️ Skipping backup log — table may not exist yet.');
END;
/

-------------------------------------------------------------
-- 8️⃣ ADVANCED REPORT: SUPPLIER PERFORMANCE SUMMARY
-------------------------------------------------------------
PROMPT ====== SUPPLIER PERFORMANCE SUMMARY REPORT ======
SELECT s.Name AS SupplierName,
       COUNT(q.TestID) AS TotalTests,
       SUM(CASE WHEN q.Result='Pass' THEN 1 ELSE 0 END) AS PassedTests,
       ROUND((SUM(CASE WHEN q.Result='Pass' THEN 1 ELSE 0 END)/COUNT(q.TestID))*100,2) AS ReliabilityPercent,
       ROUND(AVG(NVL(m.PredictedCFU,0)),2) AS AvgCFU
FROM   Supplier s
       JOIN Batch b ON s.SupplierID = b.SupplierID
       LEFT JOIN QualityTest q ON b.BatchID = q.BatchID
       LEFT JOIN MicrobePrediction m ON b.BatchID = m.BatchID
GROUP BY s.Name
ORDER BY ReliabilityPercent DESC;
/

-------------------------------------------------------------
-- 9️⃣ FINAL SAFE COMMIT
-------------------------------------------------------------
COMMIT;
PROMPT ====== DATA COMMITTED SUCCESSFULLY ======

-------------------------------------------------------------
-- 🔟 OPTIONAL ENHANCEMENT: AUTO SNAPSHOT PROCEDURE
-------------------------------------------------------------
CREATE OR REPLACE PROCEDURE CreateBackupSnapshot
IS
BEGIN
    INSERT INTO Backup_AuditLog
    VALUES (audit_seq.NEXTVAL, SYSDATE, 'Scheduled backup snapshot');
    DBMS_OUTPUT.PUT_LINE('📦 Backup snapshot logged successfully at ' || TO_CHAR(SYSDATE,'DD-MON-YYYY HH24:MI'));
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('⚠️ Snapshot logging skipped — ' || SQLERRM);
END;
/

-- Test call for auto snapshot
BEGIN
    CreateBackupSnapshot;
END;
/

PROMPT ====== TEAMMATE 4 FINAL PHASE EXECUTION COMPLETE ======
/
