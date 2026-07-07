


const express = require("express");
const router = express.Router();

const db = require("../../config/database");
const authMiddleware = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

const { uploadFile } = require("../../services/storage");


// ======================================================
// UPLOAD APP VERSION (APK / XAPK / AAB / APKS)
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




            // ======================================================
            // 1. VERIFIER LE FICHIER
            // ======================================================

            if (!req.file) {

                return res.status(400).json({

                    success:false,

                    message:"Aucun fichier envoyé"

                });

            }






            // ======================================================
            // 2. INFORMATIONS VERSION
            // ======================================================

            const {
                version_name,
                version_code,
                changelog
            } = req.body;




            if (!version_name || !version_code) {

                return res.status(400).json({

                    success:false,

                    message:"version_name et version_code sont obligatoires"

                });

            }







            // ======================================================
            // 3. VERIFIER PROPRIETAIRE APPLICATION
            // ======================================================

            const [apps] = await db.query(

                `
                SELECT id
                FROM apps
                WHERE id = ?
                AND developer_id = ?
                `,

                [
                    appId,
                    developerId
                ]

            );




            if(apps.length === 0) {


                return res.status(403).json({

                    success:false,

                    message:"Vous n'avez pas accès à cette application"

                });


            }








            // ======================================================
            // 4. FORMAT FICHIER
            // ======================================================

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




            if(!allowedFormats.includes(extension)) {


                return res.status(400).json({

                    success:false,

                    message:"Format non accepté"

                });


            }








            // ======================================================
            // 5. UPLOAD IDRIVE E2
            // ======================================================


            const uploadResult =
                await uploadFile(

                    req.file,

                    `apps/${appId}/versions/${version_name}`

                );






            if(!uploadResult.success) {


                return res.status(500).json({

                    success:false,

                    message:"Erreur pendant l'upload du fichier"

                });


            }








            // ======================================================
            // 6. ENREGISTREMENT MYSQL
            // ======================================================


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

                    changelog

                )

                VALUES

                (?, ?, ?, ?, ?, ?, ?, ?, ?)

                `,


                [

                    appId,

                    version_name,

                    version_code,

                    uploadResult.url,

                    uploadResult.key,

                    req.file.size,

                    extension,

                    "scanning",

                    changelog || null

                ]

            );









            // ======================================================
            // 7. REPONSE
            // ======================================================


            return res.status(201).json({


                success:true,


                message:"Version publiée avec succès",



                version:{


                    id:result.insertId,


                    app_id:appId,


                    version_name,


                    version_code,


                    file_format:extension,


                    file_size_bytes:req.file.size,


                    storage_key:uploadResult.key,


                    security_status:"scanning"


                }


            });







        } catch(error) {


            console.error(

                "UPLOAD VERSION ERROR:",

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

