


const express = require("express");
const router = express.Router();

const db = require("../../config/database");
const authMiddleware = require("../../middlewares/auth.middleware");


// ======================================================
// RECUPERER LES APPLICATIONS DU DEVELOPPEUR CONNECTE
// GET /api/apps/my-apps
// ======================================================

router.get(
    "/my-apps",
    authMiddleware,
    async (req, res) => {

        try {

            const developerId = req.user.id;


            const [apps] = await db.query(
                `
                SELECT
                    id,
                    package_name,
                    title,
                    short_description,
                    logo_url,
                    category,
                    status,
                    downloads_count,
                    created_at,
                    updated_at

                FROM apps

                WHERE developer_id = ?

                ORDER BY created_at DESC
                `,
                [
                    developerId
                ]
            );


            return res.status(200).json({

                success:true,

                count:apps.length,

                apps

            });



        } catch(error) {


            console.error(
                "MY APPS ERROR:",
                error
            );


            return res.status(500).json({

                success:false,

                message:"Erreur serveur interne"

            });


        }

    }
);


module.exports = router;


