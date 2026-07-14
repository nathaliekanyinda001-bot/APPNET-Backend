const express = require("express");
const router = express.Router();

const db = require("../../config/database");


// ======================================================
// SITEMAP XML DYNAMIQUE APPNET
// URL : /sitemap.xml
// ======================================================

router.get("/sitemap.xml", async (req, res) => {

    try {

        // Récupérer uniquement les applications publiées
        const [apps] = await db.execute(`
            SELECT 
                id,
                package_name,
                updated_at
            FROM apps
            WHERE status = 'published'
            ORDER BY updated_at DESC
        `);


        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;

        xml += `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;


        // ======================================================
        // PAGE ACCUEIL APPNET
        // ======================================================

        xml += `
    <url>
        <loc>https://appnet-frontend.vercel.app/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
`;



        // ======================================================
        // PAGES DES APPLICATIONS
        // ======================================================

        apps.forEach((app) => {


            const lastmod = app.updated_at
                ? new Date(app.updated_at)
                    .toISOString()
                    .split("T")[0]
                : new Date()
                    .toISOString()
                    .split("T")[0];


            xml += `
    <url>
        <loc>https://appnet-frontend.vercel.app/app-detail.html?id=${app.id}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
`;

        });



        xml += `
</urlset>
`;



        // Réponse XML pour Google
        res.setHeader(
            "Content-Type",
            "application/xml"
        );


        res.status(200).send(xml);



    } catch(error) {


        console.error(
            "❌ SITEMAP ERROR :",
            error
        );


        res.status(500).send(
            "Erreur génération sitemap"
        );


    }


});


module.exports = router;