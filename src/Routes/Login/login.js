

const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../config/database");

router.post("/", async (req, res) => {
    try {
        const { email, password } = req.body;

        // ======================
        // 1. CHECK INPUT
        // ======================
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email et mot de passe requis"
            });
        }

        // ======================
        // 2. FIND USER
        // ======================
        const [users] = await db.query(
            "SELECT * FROM developers WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur introuvable"
            });
        }

        const user = users[0];

        // ======================
        // 3. CHECK PASSWORD
        // ======================
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Mot de passe incorrect"
            });
        }

        // ======================
        // 4. GENERATE JWT
        // ======================
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // ======================
        // 5. RESPONSE
        // ======================
        return res.status(200).json({
            success: true,
            message: "Connexion réussie",
            user: {
                id: user.id,
                company_name: user.company_name,
                email: user.email,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
});

module.exports = router;


