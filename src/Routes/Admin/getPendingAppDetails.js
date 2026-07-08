

const express = require("express");
const router = express.Router();

const db = require("../../config/database");


// ======================================================
// ADMIN - RECUPERER UNE APPLICATION A EXAMINER
//
// GET /api/admin/apps/pending/:id
//
// ======================================================


router.get(
    "/apps/pending/:id",
    async (req, res) => {

        try {


            const appId = req.params.id;



            // ======================================================
            // 1. APPLICATION + DEVELOPPEUR
            // ======================================================


            const [apps] = await db.query(
                `
                SELECT

                    a.id,
                    a.package_name,
                    a.title,

                    a.short_description,
                    a.long_description,

                    a.logo_url,

                    a.category,

                    a.status,

                    a.review_message,
                    a.reviewed_at,
                    a.reviewed_by,

                    a.downloads_count,

                    a.created_at,
                    a.updated_at,


                    d.id AS developer_id,

                    d.company_name,

                    d.email,

                    d.country_code,

                    d.phone_number,

                    d.is_verified


                FROM apps a


                INNER JOIN developers d

                ON a.developer_id = d.id


                WHERE 
                    a.id = ?

                AND 
                    a.status IN ('pending','reviewing')


                `,
                [
                    appId
                ]
            );




            if(apps.length === 0){


                return res.status(404).json({

                    success:false,

                    message:
                    "Application introuvable ou déjà traitée"

                });


            }



            const app = apps[0];






            // ======================================================
            // 2. SCREENSHOTS
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
                [
                    appId
                ]
            );






            // ======================================================
            // 3. VERSIONS APPLICATION
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
                [
                    appId
                ]
            );







            // ======================================================
            // 4. REPONSE ADMIN
            // ======================================================


            return res.status(200).json({


                success:true,


                app:{


                    id:app.id,


                    package_name:
                    app.package_name,


                    title:
                    app.title,



                    descriptions:{


                        short:
                        app.short_description,


                        long:
                        app.long_description


                    },



                    category:
                    app.category,



                    status:
                    app.status,



                    logo:
                    app.logo_url,



                    developer:{


                        id:
                        app.developer_id,


                        company_name:
                        app.company_name,


                        email:
                        app.email,


                        country:
                        app.country_code,


                        phone:
                        app.phone_number,


                        verified:
                        app.is_verified


                    },




                    review:{


                        message:
                        app.review_message,


                        reviewed_at:
                        app.reviewed_at,


                        reviewed_by:
                        app.reviewed_by


                    },



                    statistics:{


                        downloads:
                        app.downloads_count


                    },



                    screenshots,



                    versions,



                    created_at:
                    app.created_at,


                    updated_at:
                    app.updated_at


                }


            });



        } catch(error){


            console.error(
                "ADMIN PENDING APP DETAILS ERROR:",
                error
            );



            return res.status(500).json({

                success:false,

                message:
                "Erreur serveur interne"

            });


        }


    }

);



module.exports = router;
