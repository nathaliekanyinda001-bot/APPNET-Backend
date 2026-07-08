

const express = require("express");
const router = express.Router();

const db = require("../../config/database");

// ======================================================
// ADMIN - CHANGER LE STATUT D'UNE APPLICATION
// PATCH /api/admin/apps/:id/status
// ======================================================

router.patch(
    "/apps/:id/status",
    async (req, res) => {

        try {

            const appId = req.params.id;

            const {
                status,
                review_message,
                reviewed_by
            } = req.body;

            // ======================================================
            // STATUTS AUTORISÉS
            // ======================================================

            const allowedStatus = [
                "pending",
                "reviewing",
                "published",
                "rejected",
                "suspended"
            ];

            if (!allowedStatus.includes(status)) {

                return res.status(400).json({
                    success: false,
                    message: "Statut invalide"
                });

            }

            // ======================================================
            // VERIFIER APPLICATION
            // ======================================================

            const [apps] = await db.query(
                `
                SELECT
                    id,
                    title,
                    status
                FROM apps
                WHERE id = ?
                `,
                [appId]
            );

            if (apps.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Application introuvable"
                });

            }

            // ======================================================
            // MISE A JOUR
            // ======================================================

                    await db.query(
            `
            UPDATE apps

            SET

                status = ?,

                review_message = ?,

                reviewed_at = NOW(),

                reviewed_by = ?

            WHERE id = ?
            `,
            [
                status,
                review_message || null,
                Number(reviewed_by) || 1,
                appId
            ]
        );

            // ======================================================
            // RECUPERER LES NOUVELLES DONNEES
            // ======================================================

            const [updated] = await db.query(
                `
                SELECT
                    id,
                    title,
                    package_name,
                    status,
                    review_message,
                    reviewed_at,
                    reviewed_by
                FROM apps
                WHERE id = ?
                `,
                [appId]
            );

            // ======================================================
            // REPONSE
            // ======================================================

            return res.status(200).json({

                success: true,

                message: "Statut mis à jour avec succès",

                app: updated[0]

            });

        } catch (error) {

            console.error(
                "UPDATE STATUS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message: "Erreur serveur interne"

            });

        }

    }
);

module.exports = router;


