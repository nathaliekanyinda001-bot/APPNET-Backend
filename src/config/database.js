const mysql = require("mysql2/promise");
require("dotenv").config();

// ===============================
// MYSQL POOL (AIVEN)
// ===============================
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: {
    rejectUnauthorized: false
  }
});

// ===============================
// TEST CONNECTION
// ===============================
async function testConnection() {
  try {
    const connection = await db.getConnection();

    console.log("✅ Connecté à MySQL Aiven");
    console.log("📦 Base de données :", process.env.DB_NAME);

    connection.release();
  } catch (error) {
    console.error("❌ Erreur connexion MySQL :", error.message);
    throw error;
  }
}

// ===============================
// EXPORTS
// ===============================
module.exports = db;
module.exports.testConnection = testConnection;


