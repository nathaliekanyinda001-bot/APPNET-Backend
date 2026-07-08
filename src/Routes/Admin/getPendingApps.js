const express = require("express");
const router = express.Router();

const db = require("../../config/database");


// ======================================================
// ADMIN - GET PENDING APPS
// GET /api/admin/apps/pending
// ======================================================

router.get(
    "/apps/pending",
    async (req, res) => {

        try {


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
                    a.created_at,
                    a.updated_at,


                    d.id AS developer_id,
                    d.company_name AS developer_name,
                    d.email AS developer_email,
                    d.phone_number AS developer_phone,
                    d.country_code AS developer_country


                FROM apps a


                INNER JOIN developers d

                ON a.developer_id = d.id


                WHERE 

                    a.status IN ('pending','reviewing')


                ORDER BY

                    a.created_at ASC

                `

            );




            return res.status(200).json({

                success:true,

                count:apps.length,

                apps

            });



        } catch(error) {


            console.error(
                "GET PENDING APPS ERROR:",
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