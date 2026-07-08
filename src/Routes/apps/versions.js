


const express = require("express");
const router = express.Router();

const db = require("../../config/database");

const authMiddleware = require("../../middlewares/auth.middleware");

const upload = require("../../middlewares/upload.middleware");

const { uploadFile } = require("../../services/storage");



// ======================================================
// DEV : ENVOYER UNE NOUVELLE VERSION APPLICATION
// POST /api/apps/:id/version
// ======================================================


router.post(

    "/:id/version",

    authMiddleware,

    upload.single("file"),


    async (req, res) => {


        try {


            const appId = req.params.id;

            const developerId = req.user.id;



            // ==================================================
            // 1 - VERIFIER FICHIER
            // ==================================================


            if (!req.file) {


                return res.status(400).json({

                    success:false,

                    message:"Aucun fichier envoyé"

                });


            }




            // ==================================================
            // 2 - DONNEES VERSION
            // ==================================================


            const {

                version_name,

                version_code,

                changelog


            } = req.body;




            if(!version_name || !version_code){


                return res.status(400).json({

                    success:false,

                    message:
                    "version_name et version_code obligatoires"

                });


            }






            // ==================================================
            // 3 - VERIFIER PROPRIETAIRE APP
            // ==================================================


            const [apps] = await db.query(

                `
                SELECT 
                    id,
                    title

                FROM apps

                WHERE id = ?

                AND developer_id = ?

                `,


                [

                    appId,

                    developerId

                ]

            );





            if(apps.length === 0){


                return res.status(403).json({

                    success:false,

                    message:
                    "Vous n'êtes pas propriétaire de cette application"

                });


            }








            // ==================================================
            // 4 - VERIFIER FORMAT
            // ==================================================


            const extension =

            req.file.originalname

            .split(".")

            .pop()

            .toLowerCase();





            const allowedFormats = [

                "apk",

                "xapk",

                "aab",

                "apks"

            ];





            if(!allowedFormats.includes(extension)){


                return res.status(400).json({

                    success:false,

                    message:
                    "Format accepté : APK, XAPK, AAB, APKS"

                });


            }








            // ==================================================
            // 5 - UPLOAD IDRIVE E2
            // ==================================================


            const uploadResult =

            await uploadFile(

                req.file,

                `apps/${appId}/versions/${version_name}`

            );







            if(!uploadResult.success){


                return res.status(500).json({

                    success:false,

                    message:
                    "Erreur stockage fichier"

                });


            }










            // ==================================================
            // 6 - INSERT DATABASE
            // ==================================================


            const [result] = await db.query(


            `

            INSERT INTO app_versions

            (

                app_id,

                version_name,

                version_code,

                file_url,

                storage_key,

                file_size_bytes,

                file_format,

                security_status,

                status,

                changelog,

                submitted_by


            )

            VALUES

            (?,?,?,?,?,?,?,?,?,?,?)


            `,


            [

                appId,

                version_name,

                Number(version_code),

                uploadResult.url,

                uploadResult.key,

                req.file.size,

                extension,

                "scanning",

                "pending",

                changelog || null,

                developerId

            ]


            );









            // ==================================================
            // 7 - REPONSE
            // ==================================================



            return res.status(201).json({


                success:true,


                message:
                "Nouvelle version envoyée pour validation",



                version:{


                    id:
                    result.insertId,


                    app_id:
                    appId,


                    version_name,


                    version_code,


                    format:
                    extension,


                    status:
                    "pending",


                    security_status:
                    "scanning",


                    download_url:
                    uploadResult.url


                }


            });







        }

        catch(error){



            console.error(

                "UPLOAD VERSION ERROR:",

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









// ======================================================
// OBTENIR TOUTES LES VERSIONS D'UNE APP
// GET /api/apps/:id/versions
// ======================================================


router.get(

    "/:id/versions",

    async(req,res)=>{


        try{


            const appId=req.params.id;



            const [versions]=await db.query(


            `

            SELECT

                id,

                app_id,

                version_name,

                version_code,

                file_url,

                file_size_bytes,

                file_format,

                security_status,

                status,

                changelog,

                created_at


            FROM app_versions


            WHERE app_id = ?


            ORDER BY version_code DESC


            `,


            [

                appId

            ]

            );




            return res.json({

                success:true,

                versions

            });





        }

        catch(error){


            console.error(

                "GET VERSIONS ERROR:",

                error

            );



            return res.status(500).json({

                success:false,

                message:
                "Erreur serveur"

            });



        }


    }

);

module.exports = router;

