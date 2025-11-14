const oracledb = require('oracledb');
require('dotenv').config();


try {
  oracledb.initOracleClient({ libDir: 'C:\\Users\\A\\Oracle\\instantclient_23_9' });
  console.log('✅ Oracle Instant Client loaded in Thick mode');
} catch (err) {
  console.error('❌ Failed to initialize Oracle Client:', err);
}

async function getConnection() {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING
    });
    console.log('✅ Connected to Oracle Database successfully');
    return connection;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    throw err;
  }
}

module.exports = { getConnection };
