const express = require("express");
const router = express.Router();

const db = require("../../config/database");
const authMiddleware = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");
const uploadToCloudinary = require("../../services/cloudinaryUpload");

// ======================
// MEDIA UPLOAD ROUTE
// ======================
router.post(
    "/:id/media",
    authMiddleware,
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "screenshots", maxCount: 10 }
    ]),
    async (req, res) => {

        try {

            const appId = req.params.id;
            const developerId = req.user.id;

            // ======================
            // 1. CHECK APP OWNERSHIP
            // ======================
            const [apps] = await db.query(
                "SELECT * FROM apps WHERE id = ? AND developer_id = ?",
                [appId, developerId]
            );

            if (apps.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Accès refusé à cette application"
                });
            }

            // ======================
            // 2. LOGO UPLOAD
            // ======================
            let logoUrl = null;

            if (req.files.logo && req.files.logo[0]) {

                const result = await uploadToCloudinary(
                    req.files.logo[0].buffer,
                    `appnet/apps/${appId}/logo`,
                    "image"
                );

                logoUrl = result.secure_url;
            }

            // ======================
            // 3. SCREENSHOTS UPLOAD
            // ======================
            const screenshotsUrls = [];

            if (req.files.screenshots && req.files.screenshots.length > 0) {

                for (let i = 0; i < req.files.screenshots.length; i++) {

                    const file = req.files.screenshots[i];

                    const result = await uploadToCloudinary(
                        file.buffer,
                        `appnet/apps/${appId}/screenshots`,
                        "image"
                    );

                    screenshotsUrls.push(result.secure_url);

                    // INSERT INTO DB
                    await db.query(
                        `INSERT INTO app_screenshots (app_id, image_url, display_order)
                         VALUES (?, ?, ?)`,
                        [appId, result.secure_url, i + 1]
                    );
                }
            }

            // ======================
            // 4. UPDATE APP LOGO
            // ======================
            if (logoUrl) {
                await db.query(
                    "UPDATE apps SET logo_url = ? WHERE id = ?",
                    [logoUrl, appId]
                );
            }

            // ======================
            // 5. RESPONSE
            // ======================
            return res.status(200).json({
                success: true,
                message: "Médias uploadés avec succès",
                data: {
                    logo: logoUrl,
                    screenshots: screenshotsUrls
                }
            });

        } catch (error) {
            console.error("MEDIA UPLOAD ERROR:", error);

            return res.status(500).json({
                success: false,
                message: "Erreur serveur interne"
            });
        }
    }
);

module.exports = router;

