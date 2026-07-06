


const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    try {
        // Récupérer le token dans les headers
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Accès refusé. Token manquant."
            });
        }

        // Format attendu : Bearer TOKEN
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token invalide."
            });
        }

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ajouter l'utilisateur dans la requête
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token expiré ou invalide."
        });
    }
}

module.exports = authMiddleware;


