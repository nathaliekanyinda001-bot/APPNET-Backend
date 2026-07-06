

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config();

// =========================
// DATABASE
// =========================
const { testConnection } = require("./config/database");

// =========================
// CLOUDINARY
// =========================
require("./config/cloudinary");

// =========================
// APP INIT
// =========================
const app = express();

// =========================
// SECURITY MIDDLEWARES
// =========================
app.use(helmet());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// =========================
// RATE LIMIT
// =========================
const apiLimiter = require("./middlewares/rateLimit.middleware");
app.use("/api", apiLimiter);

// =========================
// ROUTES IMPORTS
// =========================
const registerRoute = require("./Routes/Login/register");
const loginRoute = require("./Routes/Login/login");
const createAppRoute = require("./Routes/Apps/createApp");
const mediaRoute = require("./Routes/Apps/uploadMedia");



// =========================
// ROUTES
// =========================

// Auth
app.use("/api/auth/register", registerRoute);
app.use("/api/auth/login", loginRoute);
// Apps
app.use("/api/apps", createAppRoute);
app.use("/api/apps", mediaRoute);


// =========================
// HOME ROUTE
// =========================
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 APPNET Backend API fonctionne correctement",
        version: "1.0.0"
    });
});

// =========================
// API HEALTH
// =========================
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {

        // Test MySQL Aiven
        await testConnection();

        console.log("🚀 DB READY - STARTING SERVER");

        app.listen(PORT, () => {

            console.log(`
==================================================
☁️ CLOUDINARY CONNECTED
🌍 Cloud Name : ${process.env.CLOUDINARY_CLOUD_NAME}
==================================================

==================================================
🚀 APPNET SERVER STARTED SUCCESSFULLY
🌍 URL  : http://localhost:${PORT}
⚡ PORT : ${PORT}
📦 DATABASE : ${process.env.DB_NAME}
📅 STATUS : ONLINE
==================================================
            `);

        });

    } catch (error) {

        console.error("❌ DATABASE CONNECTION FAILED");
        console.error(error.message);

        process.exit(1);

    }
}

startServer();