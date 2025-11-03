SET SERVEROUTPUT ON;

-------------------------------------------------------------
-- 1️⃣ DROP OLD TABLES SAFELY (Reset for Clean Execution)
-------------------------------------------------------------
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE MicrobePrediction CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE QualityTest CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Batch CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Inspector CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE Supplier CASCADE CONSTRAINTS';
    EXECUTE IMMEDIATE 'DROP TABLE FoodItem CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/
-------------------------------------------------------------
-- 2️⃣ CREATE MAIN TABLES (Schema Core)
-------------------------------------------------------------

-- Table 1: FoodItem
CREATE TABLE FoodItem (
    FoodID NUMBER PRIMARY KEY,
    Name VARCHAR2(100) NOT NULL,
    Category VARCHAR2(50),
    Description VARCHAR2(200)
);

-- Table 2: Supplier
CREATE TABLE Supplier (
    SupplierID NUMBER PRIMARY KEY,
    Name VARCHAR2(100) NOT NULL,
    ContactEmail VARCHAR2(100),
    ContactPhone VARCHAR2(15),
    Address VARCHAR2(150)
);

-- Table 3: Inspector
CREATE TABLE Inspector (
    InspectorID NUMBER PRIMARY KEY,
    Name VARCHAR2(100) NOT NULL,
    Lab VARCHAR2(100),
    Contact VARCHAR2(15)
);

-- Table 4: Batch
CREATE TABLE Batch (
    BatchID NUMBER PRIMARY KEY,
    FoodID NUMBER REFERENCES FoodItem(FoodID),
    SupplierID NUMBER REFERENCES Supplier(SupplierID),
    ManufactureDate DATE,
    ExpiryDate DATE,
    Quantity NUMBER,
    Location VARCHAR2(100)
);

-- Table 5: QualityTest
CREATE TABLE QualityTest (
    TestID NUMBER PRIMARY KEY,
    BatchID NUMBER REFERENCES Batch(BatchID),
    InspectorID NUMBER REFERENCES Inspector(InspectorID),
    pH NUMBER(4,2),
    MoisturePct NUMBER(5,2),
    BacteriaCount NUMBER,
    Result VARCHAR2(20),
    Notes VARCHAR2(200)
);

-------------------------------------------------------------
-- 3️⃣ ADD PREDICTIVE MICROBIOLOGY MODULE TABLE
-------------------------------------------------------------
CREATE TABLE MicrobePrediction (
    PredictionID NUMBER PRIMARY KEY,
    BatchID NUMBER REFERENCES Batch(BatchID),
    Temperature NUMBER(5,2) CHECK (Temperature BETWEEN 0 AND 50),
    Humidity NUMBER(5,2) CHECK (Humidity BETWEEN 0 AND 100),
    PredictedCFU NUMBER(10,2),
    PredictionDate DATE DEFAULT SYSDATE,
    MethodUsed VARCHAR2(50)
);

-------------------------------------------------------------
-- 4️⃣ CREATE SEQUENCES FOR AUTO-INCREMENT
-------------------------------------------------------------
CREATE SEQUENCE food_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE supplier_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE inspector_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE batch_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE test_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE microbe_seq START WITH 1 INCREMENT BY 1;

-------------------------------------------------------------
-- 5️⃣ INSERT SAMPLE DATA (Extended)
-------------------------------------------------------------
-- Food Items
INSERT INTO FoodItem VALUES (food_seq.NEXTVAL, 'Milk', 'Dairy', 'Pasteurized Cow Milk');
INSERT INTO FoodItem VALUES (food_seq.NEXTVAL, 'Bread', 'Bakery', 'Whole Wheat Bread');
INSERT INTO FoodItem VALUES (food_seq.NEXTVAL, 'Juice', 'Beverage', 'Orange Fruit Juice');

-- Suppliers
INSERT INTO Supplier VALUES (supplier_seq.NEXTVAL, 'Amul Pvt Ltd', 'contact@amul.com', '9876543210', 'Anand, Gujarat');
INSERT INTO Supplier VALUES (supplier_seq.NEXTVAL, 'Britannia Co.', 'info@britannia.com', '9812345670', 'Bangalore, Karnataka');
INSERT INTO Supplier VALUES (supplier_seq.NEXTVAL, 'Real Juices', 'help@realjuice.com', '9765432109', 'Pune, Maharashtra');

-- Inspectors
INSERT INTO Inspector VALUES (inspector_seq.NEXTVAL, 'Dr. A. Sharma', 'Food Research Lab', '9123456780');
INSERT INTO Inspector VALUES (inspector_seq.NEXTVAL, 'Dr. R. Mehta', 'NABL Testing Centre', '9988776655');

-- Batches
INSERT INTO Batch VALUES (batch_seq.NEXTVAL, 1, 1, TO_DATE('2025-09-01', 'YYYY-MM-DD'), TO_DATE('2025-10-01', 'YYYY-MM-DD'), 500, 'Anand');
INSERT INTO Batch VALUES (batch_seq.NEXTVAL, 2, 2, TO_DATE('2025-08-20', 'YYYY-MM-DD'), TO_DATE('2025-09-20', 'YYYY-MM-DD'), 300, 'Bangalore');
INSERT INTO Batch VALUES (batch_seq.NEXTVAL, 3, 3, TO_DATE('2025-09-05', 'YYYY-MM-DD'), TO_DATE('2025-11-05', 'YYYY-MM-DD'), 200, 'Pune');

-- Quality Tests
INSERT INTO QualityTest VALUES (test_seq.NEXTVAL, 1, 1, 6.7, 3.2, 200, 'Pass', 'Meets all standards');
INSERT INTO QualityTest VALUES (test_seq.NEXTVAL, 2, 2, 5.8, 12.1, 900, 'Fail', 'High moisture');
INSERT INTO QualityTest VALUES (test_seq.NEXTVAL, 3, 1, 6.1, 6.0, 300, 'Pass', 'Acceptable range');

-- Predictive Data (Simulated using Gompertz / Baranyi model)
INSERT INTO MicrobePrediction VALUES (microbe_seq.NEXTVAL, 1, 25.5, 65.0, 520.75, SYSDATE, 'Gompertz');
INSERT INTO MicrobePrediction VALUES (microbe_seq.NEXTVAL, 2, 30.0, 72.0, 1250.20, SYSDATE, 'Baranyi');
INSERT INTO MicrobePrediction VALUES (microbe_seq.NEXTVAL, 3, 20.0, 55.0, 480.60, SYSDATE, 'ML_Model');

COMMIT;

-------------------------------------------------------------
-- 6️⃣ CREATE INTEGRATED VIEW FOR REPORTING
-------------------------------------------------------------
CREATE OR REPLACE VIEW FullQualityReport AS
SELECT 
    f.Name AS FoodName,
    f.Category,
    s.Name AS SupplierName,
    b.BatchID,
    b.Location,
    q.Result AS LabResult,
    m.PredictedCFU,
    m.MethodUsed,
    CASE 
        WHEN m.PredictedCFU > 1000 THEN 'High Risk'
        ELSE 'Safe'
    END AS MicrobialRisk
FROM FoodItem f
JOIN Batch b ON f.FoodID = b.FoodID
JOIN Supplier s ON b.SupplierID = s.SupplierID
JOIN QualityTest q ON b.BatchID = q.BatchID
LEFT JOIN MicrobePrediction m ON m.BatchID = b.BatchID;

-------------------------------------------------------------
-- 7️⃣ VALIDATION & OUTPUT CHECKS
-------------------------------------------------------------
PROMPT ====== VALIDATION: ROW COUNTS ======
SELECT COUNT(*) AS Food_Items FROM FoodItem;
SELECT COUNT(*) AS Suppliers FROM Supplier;
SELECT COUNT(*) AS Inspectors FROM Inspector;
SELECT COUNT(*) AS Batches FROM Batch;
SELECT COUNT(*) AS Tests FROM QualityTest;
SELECT COUNT(*) AS Predictions FROM MicrobePrediction;

PROMPT ====== SAMPLE INTEGRATED DATA ======
SELECT * FROM FullQualityReport;

PROMPT ====== HIGH RISK PRODUCTS (Predicted CFU > 1000) ======
SELECT FoodName, SupplierName, PredictedCFU, MicrobialRisk
FROM FullQualityReport
WHERE MicrobialRisk = 'High Risk';

PROMPT ====== DATA DICTIONARY VIEW ======
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, DATA_LENGTH
FROM USER_TAB_COLUMNS
WHERE TABLE_NAME IN ('FOODITEM','SUPPLIER','INSPECTOR','BATCH','QUALITYTEST','MICROBEPREDICTION')
ORDER BY TABLE_NAME, COLUMN_ID;

CREATE OR REPLACE TRIGGER trg_auto_microbe_predict
AFTER INSERT ON Batch
FOR EACH ROW
BEGIN
    INSERT INTO MicrobePrediction
    VALUES (microbe_seq.NEXTVAL, :NEW.BatchID, 25 + DBMS_RANDOM.VALUE(-5,5),
            60 + DBMS_RANDOM.VALUE(-10,10),
            500 + DBMS_RANDOM.VALUE(-100,600),
            SYSDATE, 'AutoPredict_Model');
END;
/
