


const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// ===============================
// MYSQL POOL
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
    ca: fs.readFileSync(
      path.join(__dirname, "../../certs/ca.pem")
    ),
  },
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
  }
}

// ===============================
// EXPORTS
// ===============================
module.exports = db;

module.exports.testConnection = testConnection;

