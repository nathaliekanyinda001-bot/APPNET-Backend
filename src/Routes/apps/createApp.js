


const express = require("express");
const router = express.Router();

const db = require("../../config/database");
const authMiddleware = require("../../middlewares/auth.middleware");

// ======================
// CREATE APP ROUTE
// ======================
router.post("/", authMiddleware, async (req, res) => {
    try {

        // ======================
        // 1. GET DEVELOPER ID FROM TOKEN
        // ======================
        const developer_id = req.user.id;

        // ======================
        // 2. GET BODY DATA
        // ======================
        const {
            package_name,
            title,
            short_description,
            long_description,
            category
        } = req.body;

        // ======================
        // 3. VALIDATION
        // ======================
        if (
            !package_name ||
            !title ||
            !short_description ||
            !long_description ||
            !category
        ) {
            return res.status(400).json({
                success: false,
                message: "Tous les champs sont obligatoires"
            });
        }

        // ======================
        // 4. CHECK IF APP EXISTS
        // ======================
        const [existing] = await db.query(
            "SELECT id FROM apps WHERE package_name = ?",
            [package_name]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Ce package_name existe déjà"
            });
        }

        // ======================
        // 5. INSERT APP
        // ======================
        const [result] = await db.query(
            `INSERT INTO apps
            (
                developer_id,
                package_name,
                title,
                short_description,
                long_description,
                category,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                developer_id,
                package_name,
                title,
                short_description,
                long_description,
                category,
                "pending"
            ]
        );

        // ======================
        // 6. RESPONSE
        // ======================
        return res.status(201).json({
            success: true,
            message: "Application créée avec succès",
            app: {
                id: result.insertId,
                developer_id,
                package_name,
                title,
                status: "pending"
            }
        });

    } catch (error) {

        console.error("CREATE APP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Erreur serveur interne"
        });

    }
});

module.exports = router;

