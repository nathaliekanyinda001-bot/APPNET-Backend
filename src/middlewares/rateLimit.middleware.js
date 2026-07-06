

const rateLimit = require("express-rate-limit");

// Limiteur global API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requêtes par IP
    standardHeaders: true, // retourne infos rate limit dans headers
    legacyHeaders: false, // désactive vieux headers

    message: {
        success: false,
        message: "Trop de requêtes. Veuillez réessayer dans quelques minutes."
    }
});

module.exports = apiLimiter;

