


const express = require("express");
const router = express.Router();

const db = require("../../config/database");

const {
    generateDownloadUrl
} = require("../../services/storage");


// ======================================================
// DOWNLOAD APP VERSION
// GET /api/apps/:id/download/:versionId
// ======================================================

router.get(
    "/:id/download/:versionId",
    async (req, res) => {

        try {


            const appId = req.params.id;
            const versionId = req.params.versionId;



            // ======================================================
            // 1. RECHERCHER LA VERSION
            // ======================================================

            const [versions] = await db.query(
                `
                SELECT

                    av.id,
                    av.app_id,
                    av.version_name,
                    av.version_code,
                    av.storage_key,
                    av.file_size_bytes,
                    av.file_format,
                    av.security_status,
                    av.changelog,

                    a.title,
                    a.status

                FROM app_versions av

                INNER JOIN apps a

                ON av.app_id = a.id

                WHERE av.id = ?
                AND av.app_id = ?

                `,
                [
                    versionId,
                    appId
                ]
            );



            if (versions.length === 0) {

                return res.status(404).json({

                    success:false,

                    message:"Version introuvable"

                });

            }



            const version = versions[0];




            // ======================================================
            // 2. VERIFIER STATUT APPLICATION
            // ======================================================

            if(version.status !== "published") {

                return res.status(403).json({

                    success:false,

                    message:"Cette application n'est pas encore publiée"

                });

            }





            // ======================================================
            // 3. VERIFICATION SECURITE
            // ======================================================


            if(
                version.security_status === "infected"
            ) {


                return res.status(403).json({

                    success:false,

                    message:"Cette application est bloquée pour raison de sécurité"

                });


            }





            // ======================================================
            // 4. GENERER URL IDRIVE SECURISEE
            // ======================================================


            if(!version.storage_key) {


                return res.status(500).json({

                    success:false,

                    message:"Fichier de stockage introuvable"

                });


            }



            const downloadUrl =
                await generateDownloadUrl(
                    version.storage_key
                );




            if(!downloadUrl) {


                return res.status(500).json({

                    success:false,

                    message:"Impossible de générer le lien de téléchargement"

                });


            }







            // ======================================================
            // 5. AUGMENTER TELECHARGEMENTS
            // ======================================================


            await db.query(

                `
                UPDATE apps

                SET downloads_count =
                downloads_count + 1

                WHERE id = ?

                `,

                [
                    appId
                ]

            );








            // ======================================================
            // 6. RESPONSE
            // ======================================================


            return res.status(200).json({


                success:true,


                message:
                "Lien de téléchargement généré",



                download:{


                    app_id:
                    version.app_id,


                    app_name:
                    version.title,


                    version_name:
                    version.version_name,


                    version_code:
                    version.version_code,


                    format:
                    version.file_format,


                    size:
                    version.file_size_bytes,


                    url:
                    downloadUrl,


                    expires_in:
                    "1 heure",


                    changelog:
                    version.changelog


                }


            });




        } catch(error) {


            console.error(
                "DOWNLOAD ERROR:",
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