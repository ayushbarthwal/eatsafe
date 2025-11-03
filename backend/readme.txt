EatSafe Backend Setup Guide
==========================

This backend uses Node.js, Express, and Oracle 11g for a basic food safety management system.

Prerequisites
-------------
- Node.js and npm installed
- Oracle 11g database running and accessible
- Oracle user with privileges to create tables, views, procedures, and sequences

Setup Steps
-----------

1. Install Dependencies
   Open a terminal in this folder and run:
   npm install

2. Configure Database Connection
   Edit the .env file with your Oracle 11g credentials:
   ORACLE_USER=your_db_user
   ORACLE_PASSWORD=your_db_password
   ORACLE_CONNECT_STRING=your_db_host:your_db_port/your_service

   Example for local Oracle 11g:
   ORACLE_USER=eatsafe_user
   ORACLE_PASSWORD=yourpassword
   ORACLE_CONNECT_STRING=localhost:1521/xe

3. Set Up the Database
   Use Oracle SQL*Plus or Oracle SQL Developer to run all SQL files in the db/ folder in this order:
   - food_quality_schema_part1.sql
   - food_quality_constraints_views_part2.sql
   - food_quality_procedures_part3.sql
   - food_quality_transactions_part4.sql

   This will create all tables, views, procedures, and sample data.

4. Start the Backend Server
   node index.js
   (or use npx nodemon index.js for auto-reload during development)

5. API Endpoints
   The backend exposes these endpoints:

   Food Items:
     GET    /api/food           - List all food items
     POST   /api/food           - Add a new food item (body: { description })
     DELETE /api/food/:id       - Delete a food item by ID

   Suppliers:
     GET    /api/supplier       - List all suppliers
     POST   /api/supplier       - Add a new supplier (body: { name })
     DELETE /api/supplier/:id   - Delete a supplier by ID

   Batches:
     GET    /api/batch          - List all batches
     POST   /api/batch          - Add a new batch (body: { foodId, supplierId, status })
     DELETE /api/batch/:id      - Delete a batch by ID

   Home:
     GET    /                   - Backend status message

6. Testing
   You can use Postman, curl, or your frontend to interact with these endpoints.

Notes
-----
- Make sure your Oracle 11g database is running and accessible from your backend.
- If you change the database schema, re-run the SQL files as needed.
- For more entities or advanced features, add similar routes in index.js.

Contact
-------
For questions, contact the project owner or your instructor.