

const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../config/database");

router.post("/", async (req, res) => {
    try {
        const { company_name, email, password, phone_number, country_code } = req.body;

        // ======================
        // 1. CHECK INPUT
        // ======================
        if (!company_name || !email || !password || !country_code) {
            return res.status(400).json({
                success: false,
                message: "Champs obligatoires manquants"
            });
        }

        // ======================
        // 2. CHECK EMAIL EXIST
        // ======================
        const [user] = await db.query(
            "SELECT * FROM developers WHERE email = ?",
            [email]
        );

        if (user.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email déjà utilisé"
            });
        }

        // ======================
        // 3. HASH PASSWORD
        // ======================
        const hashedPassword = await bcrypt.hash(password, 10);

        // ======================
        // 4. INSERT USER
        // ======================
        const [result] = await db.query(
            `INSERT INTO developers 
            (company_name, email, password_hash, phone_number, country_code, role, is_verified)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                company_name,
                email,
                hashedPassword,
                phone_number || null,
                country_code,
                "developer",
                0
            ]
        );

        // ======================
        // 5. JWT TOKEN
        // ======================
        const token = jwt.sign(
            {
                id: result.insertId,
                email,
                role: "developer"
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // ======================
        // 6. RESPONSE
        // ======================
        return res.status(201).json({
            success: true,
            message: "Compte créé avec succès",
            user: {
                id: result.insertId,
                company_name,
                email,
                role: "developer"
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

