SET SERVEROUTPUT ON;

BEGIN
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
-- TEAMMATE 1 (Schema Setup + Sample Data Insertion)
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
-- Create Sequences for Auto Increment
-------------------------------------------------------------
CREATE SEQUENCE food_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE supplier_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE inspector_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE batch_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE test_seq START WITH 1 INCREMENT BY 1;

-------------------------------------------------------------
-- Insert Sample Data (50-60% Work)
-------------------------------------------------------------
INSERT INTO FoodItem VALUES (food_seq.NEXTVAL, 'Milk', 'Dairy', 'Pasteurized Cow Milk');
INSERT INTO FoodItem VALUES (food_seq.NEXTVAL, 'Bread', 'Bakery', 'Whole Wheat Bread');
INSERT INTO FoodItem VALUES (food_seq.NEXTVAL, 'Juice', 'Beverage', 'Orange Fruit Juice');

INSERT INTO Supplier VALUES (supplier_seq.NEXTVAL, 'Amul Pvt Ltd', 'contact@amul.com', '9876543210', 'Anand, Gujarat');
INSERT INTO Supplier VALUES (supplier_seq.NEXTVAL, 'Britannia Co.', 'info@britannia.com', '9812345670', 'Bangalore, Karnataka');
INSERT INTO Supplier VALUES (supplier_seq.NEXTVAL, 'Real Juices', 'help@realjuice.com', '9765432109', 'Pune, Maharashtra');

INSERT INTO Inspector VALUES (inspector_seq.NEXTVAL, 'Dr. A. Sharma', 'Food Research Lab', '9123456780');
INSERT INTO Inspector VALUES (inspector_seq.NEXTVAL, 'Dr. R. Mehta', 'NABL Testing Centre', '9988776655');

INSERT INTO Batch VALUES (batch_seq.NEXTVAL, 1, 1, TO_DATE('2025-09-01', 'YYYY-MM-DD'), TO_DATE('2025-10-01', 'YYYY-MM-DD'), 500, 'Anand');
INSERT INTO Batch VALUES (batch_seq.NEXTVAL, 2, 2, TO_DATE('2025-08-20', 'YYYY-MM-DD'), TO_DATE('2025-09-20', 'YYYY-MM-DD'), 300, 'Bangalore');
INSERT INTO Batch VALUES (batch_seq.NEXTVAL, 3, 3, TO_DATE('2025-09-05', 'YYYY-MM-DD'), TO_DATE('2025-11-05', 'YYYY-MM-DD'), 200, 'Pune');

INSERT INTO QualityTest VALUES (test_seq.NEXTVAL, 1, 1, 6.7, 3.2, 200, 'Pass', 'Meets all standards');
INSERT INTO QualityTest VALUES (test_seq.NEXTVAL, 2, 2, 5.8, 12.1, 900, 'Fail', 'High moisture');
INSERT INTO QualityTest VALUES (test_seq.NEXTVAL, 3, 1, 6.1, 6.0, 300, 'Pass', 'Acceptable range');

COMMIT;

-------------------------------------------------------------
-- Basic Validation Queries (Output Verification)
-------------------------------------------------------------
PROMPT ====== TABLE COUNTS ======
SELECT COUNT(*) AS Total_FoodItems FROM FoodItem;
SELECT COUNT(*) AS Total_Suppliers FROM Supplier;
SELECT COUNT(*) AS Total_Batches FROM Batch;
SELECT COUNT(*) AS Total_Tests FROM QualityTest;

PROMPT ====== SAMPLE JOIN CHECK ======
SELECT f.Name AS Food, s.Name AS Supplier, q.Result
FROM FoodItem f
JOIN Batch b ON f.FoodID = b.FoodID
JOIN Supplier s ON s.SupplierID = b.SupplierID
JOIN QualityTest q ON b.BatchID = q.BatchID;
/
