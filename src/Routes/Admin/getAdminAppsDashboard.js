

const express = require("express");
const router = express.Router();

const db = require("../../config/database");


// ======================================================
// ADMIN DASHBOARD - LISTE DES APPLICATIONS PAR STATUT
//
// GET /api/admin/apps/dashboard
//
// ======================================================


router.get(
    "/apps/dashboard",
    async (req, res) => {

        try {


            // ======================================================
            // 1. RECUPERER TOUTES LES APPLICATIONS
            // ======================================================


            const [apps] = await db.query(
                `
                SELECT

                    a.id,
                    a.package_name,
                    a.title,
                    a.short_description,
                    a.logo_url,
                    a.category,
                    a.status,

                    a.downloads_count,

                    a.review_message,
                    a.reviewed_at,

                    a.created_at,
                    a.updated_at,


                    d.id AS developer_id,
                    d.company_name,
                    d.email


                FROM apps a


                INNER JOIN developers d

                ON a.developer_id = d.id


                ORDER BY a.created_at DESC

                `
            );




            // ======================================================
            // 2. CLASSER PAR STATUT
            // ======================================================


            const dashboard = {


                pending: [],


                reviewing: [],


                published: [],


                rejected: [],


                suspended: []


            };





            apps.forEach(app => {


                if(dashboard[app.status]) {


                    dashboard[app.status].push(app);


                }


            });







            // ======================================================
            // 3. REPONSE ADMIN
            // ======================================================


            return res.status(200).json({


                success:true,


                statistics:{


                    total: apps.length,


                    pending:
                    dashboard.pending.length,


                    reviewing:
                    dashboard.reviewing.length,


                    published:
                    dashboard.published.length,


                    rejected:
                    dashboard.rejected.length,


                    suspended:
                    dashboard.suspended.length


                },



                dashboard



            });



        } catch(error) {



            console.error(
                "ADMIN DASHBOARD APPS ERROR:",
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

