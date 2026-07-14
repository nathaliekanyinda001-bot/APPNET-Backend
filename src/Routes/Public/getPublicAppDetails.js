

const express = require("express");
const router = express.Router();

const db = require("../../config/database");


// ======================================================
// GET PUBLIC APP DETAILS
// GET /api/public/apps/:id
// ======================================================

router.get(
    "/apps/:id",
    async(req,res)=>{


        try {


            const appId = req.params.id;



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
                WHERE id = ?
                AND status = 'published'
                `,
                [appId]
            );



            if(apps.length === 0){

                return res.status(404).json({

                    success:false,

                    message:"Application introuvable"

                });

            }



            const app = apps[0];



            // Versions publiques

            const [versions] = await db.query(
                `
                SELECT
                    id,
                    version_name,
                    version_code,
                    file_size_bytes,
                    created_at
                FROM app_versions
                WHERE app_id = ?
                ORDER BY created_at DESC
                `,
                [appId]
            );



            // Screenshots

            const [screenshots] = await db.query(
                `
                SELECT
                    id,
                    image_url
                FROM app_screenshots
                WHERE app_id = ?
                `,
                [appId]
            );



            res.json({

                success:true,

                app,

                versions,

                screenshots

            });



        }catch(error){


            console.error(
                "GET APP DETAILS ERROR:",
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

