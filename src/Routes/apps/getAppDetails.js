

const express = require("express");
const router = express.Router();

const db = require("../../config/database");
const authMiddleware = require("../../middlewares/auth.middleware");

// ======================================================
// DETAIL D'UNE APPLICATION DU DEVELOPPEUR CONNECTE
// GET /api/apps/:id
// ======================================================

router.get(
    "/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const appId = req.params.id;
            const developerId = req.user.id;

            // ======================================================
            // 1. RECUPERER L'APPLICATION
            // ======================================================

            const [apps] = await db.query(
                `
                SELECT
                    id,
                    developer_id,
                    package_name,
                    title,
                    short_description,
                    long_description,
                    logo_url,
                    category,
                    status,
                    review_message,
                    reviewed_at,
                    reviewed_by,
                    downloads_count,
                    created_at,
                    updated_at
                FROM apps
                WHERE id = ?
                AND developer_id = ?
                `,
                [
                    appId,
                    developerId
                ]
            );

            if (apps.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Application introuvable"
                });

            }

            const app = apps[0];

            // ======================================================
            // 2. CAPTURES D'ECRAN
            // ======================================================

            const [screenshots] = await db.query(
                `
                SELECT
                    id,
                    image_url,
                    display_order
                FROM app_screenshots
                WHERE app_id = ?
                ORDER BY display_order ASC
                `,
                [appId]
            );

            // ======================================================
            // 3. VERSIONS
            // ======================================================

            const [versions] = await db.query(
                `
                SELECT
                    id,
                    version_name,
                    version_code,
                    file_format,
                    file_size_bytes,
                    security_status,
                    changelog,
                    created_at
                FROM app_versions
                WHERE app_id = ?
                ORDER BY created_at DESC
                `,
                [appId]
            );

            // ======================================================
            // 4. REPONSE
            // ======================================================

            return res.status(200).json({

                success: true,

                app: {

                    id: app.id,

                    package_name: app.package_name,

                    title: app.title,

                    short_description: app.short_description,

                    long_description: app.long_description,

                    logo_url: app.logo_url,

                    category: app.category,

                    status: app.status,

                    review_message: app.review_message,

                    reviewed_at: app.reviewed_at,

                    reviewed_by: app.reviewed_by,

                    downloads_count: app.downloads_count,

                    created_at: app.created_at,

                    updated_at: app.updated_at,

                    screenshots,

                    versions

                }

            });

        } catch (error) {

            console.error(
                "APP DETAILS ERROR:",
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

