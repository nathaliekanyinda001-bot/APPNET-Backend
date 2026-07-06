const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Middleware rate limit
const apiLimiter = require("./middlewares/rateLimit.middleware");

const app = express(); // ✅ DOIT ÊTRE EN PREMIER

// ===============================
// SECURITY MIDDLEWARES
// ===============================
app.use(helmet());

// Limiter les requêtes (sécurité anti-abus)
app.use("/api", apiLimiter);

// ===============================
// CORS CONFIG
// ===============================
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// ===============================
// BODY PARSER
// ===============================
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// ===============================
// LOGGER
// ===============================
app.use(morgan("dev"));

// ===============================
// ROUTES DE BASE
// ===============================

// Route principale
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 APPNET Backend API est opérationnel",
        version: "1.0.0"
    });
});

// Route santé API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date()
    });
});

// ===============================
// ROUTES AUTH
// ===============================
app.use("/api/auth/register", require("./Routes/Login/register"));
app.use("/api/auth/login", require("./Routes/Login/login"));
// ===============================
// FUTURE ROUTES
// ===============================
// app.use("/api/auth/login", require("./Routes/Login/login"));
// app.use("/api/apps", require("./Routes/Apps/apps"));

// ===============================
// ERROR HANDLER (optionnel)
// ===============================
// const errorMiddleware = require("./middlewares/error.middleware");
// app.use(errorMiddleware);

module.exports = app;