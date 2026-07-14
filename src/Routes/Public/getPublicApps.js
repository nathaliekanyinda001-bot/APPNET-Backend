

const express = require("express");
const router = express.Router();

const db = require("../../config/database");


// ======================================================
// GET PUBLIC APPS
// GET /api/public/apps
// Retourne toutes les applications publiées
// ======================================================

router.get(
    "/apps",
    async (req, res) => {

        try {

            const [apps] = await db.query(
                `
                SELECT
                    id,
                    package_name,
                    title,
                    short_description,
                    long_description,
                    logo_url,
                    category,
                    downloads_count,
                    created_at
                FROM apps
                WHERE status = 'published'
                ORDER BY created_at DESC
                `
            );


            res.json({

                success:true,

                count: apps.length,

                apps

            });


        } catch(error) {

            console.error(
                "GET PUBLIC APPS ERROR:",
                error
            );


            res.status(500).json({

                success:false,

                message:"Erreur serveur"

            });

        }

    }
);


module.exports = router;