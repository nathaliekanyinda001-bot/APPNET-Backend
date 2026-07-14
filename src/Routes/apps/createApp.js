


const express = require("express");
const router = express.Router();

const db = require("../../config/database");
const authMiddleware = require("../../middlewares/auth.middleware");


// ======================
// GENERATE SEO SLUG
// ======================
function generateSlug(text){

    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

}



// ======================
// CREATE APP ROUTE
// ======================
router.post("/", authMiddleware, async (req, res) => {

    try {


        // ======================
        // 1. GET DEVELOPER ID
        // ======================
        const developer_id = req.user.id;



        // ======================
        // 2. GET BODY DATA
        // ======================
        const {
            package_name,
            title,
            short_description,
            long_description,
            category
        } = req.body;



        // ======================
        // 3. VALIDATION
        // ======================
        if (
            !package_name ||
            !title ||
            !short_description ||
            !long_description ||
            !category
        ) {

            return res.status(400).json({

                success:false,

                message:"Tous les champs sont obligatoires"

            });

        }




        // ======================
        // 4. CHECK PACKAGE EXIST
        // ======================
        const [existingPackage] = await db.query(

            "SELECT id FROM apps WHERE package_name = ?",

            [package_name]

        );


        if(existingPackage.length > 0){

            return res.status(409).json({

                success:false,

                message:"Ce package_name existe déjà"

            });

        }





        // ======================
        // 5. CREATE UNIQUE SLUG
        // ======================

        let slug = generateSlug(title);


        let finalSlug = slug;


        let counter = 1;



        while(true){

            const [slugExist] = await db.query(

                "SELECT id FROM apps WHERE slug = ?",

                [finalSlug]

            );


            if(slugExist.length === 0){

                break;

            }


            finalSlug = `${slug}-${counter}`;

            counter++;

        }





        // ======================
        // 6. INSERT APP
        // ======================

        const [result] = await db.query(

            `INSERT INTO apps
            (
                developer_id,
                package_name,
                title,
                slug,
                short_description,
                long_description,
                category,
                status
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

            [

                developer_id,

                package_name,

                title,

                finalSlug,

                short_description,

                long_description,

                category,

                "pending"

            ]

        );





        // ======================
        // 7. RESPONSE
        // ======================

        return res.status(201).json({

            success:true,

            message:"Application créée avec succès",

            app:{

                id:result.insertId,

                developer_id,

                package_name,

                title,

                slug:finalSlug,

                status:"pending"

            }

        });



    } catch(error){


        console.error(
            "CREATE APP ERROR:",
            error
        );


        return res.status(500).json({

            success:false,

            message:"Erreur serveur interne"

        });


    }

});



module.exports = router;