

const express = require("express");
const router = express.Router();

const db = require("../../config/database");


// ======================================================
// GET PUBLIC APP DETAILS BY SLUG
// GET /api/public/apps/slug/:slug
// ======================================================

router.get(
    "/apps/slug/:slug",
    async(req,res)=>{

        try {


            const slug = req.params.slug;



            const [apps] = await db.query(
                `
                SELECT
                    id,
                    package_name,
                    title,
                    slug,
                    short_description,
                    long_description,
                    logo_url,
                    category,
                    downloads_count,
                    created_at
                FROM apps
                WHERE slug = ?
                AND status = 'published'
                `,
                [slug]
            );



            if(apps.length === 0){

                return res.status(404).json({

                    success:false,

                    message:"Application introuvable"

                });

            }



            const app = apps[0];



            // ==========================
            // VERSIONS
            // ==========================

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
                [app.id]
            );





            // ==========================
            // SCREENSHOTS
            // ==========================

            const [screenshots] = await db.query(
                `
                SELECT
                    id,
                    image_url
                FROM app_screenshots
                WHERE app_id = ?
                `,
                [app.id]
            );





            return res.json({

                success:true,

                app,

                versions,

                screenshots

            });



        }catch(error){


            console.error(
                "GET APP BY SLUG ERROR:",
                error
            );


            return res.status(500).json({

                success:false,

                message:"Erreur serveur"

            });


        }


    }
);


module.exports = router;