

const express = require("express");
const router = express.Router();

const db = require("../../config/database");


// ======================================================
// ADMIN - VOIR LES NOUVELLES VERSIONS EN ATTENTE
// GET /api/admin/app-versions/dashboard
// ======================================================


router.get(

    "/dashboard",

    async (req, res) => {


        try {


            const [versions] = await db.query(`

                SELECT

                    av.id,

                    av.app_id,

                    a.title AS app_name,

                    a.package_name,

                    a.developer_id,

                    a.status AS app_status,


                    av.version_name,

                    av.version_code,

                    av.file_format,

                    av.file_url,

                    av.file_size_bytes,

                    av.security_status,

                    av.status,

                    av.changelog,

                    av.created_at


                FROM app_versions av


                INNER JOIN apps a

                ON a.id = av.app_id


                WHERE av.status IN (

                    'pending',

                    'reviewing'

                )


                ORDER BY av.created_at DESC


            `);



            return res.status(200).json({

                success:true,

                count: versions.length,

                updates: versions

            });



        }


        catch(error){


            console.error(

                "ADMIN VERSION DASHBOARD ERROR:",

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


