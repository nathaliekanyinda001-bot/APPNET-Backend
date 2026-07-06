

require("dotenv").config();

const http = require("http");
const app = require("./app");
const { testConnection } = require("./config/database");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

async function startServer() {
    try {

        // Vérifier la connexion MySQL
        await testConnection();

        server.listen(PORT, () => {

            console.log("");
            console.log("========================================");
            console.log("🚀 APPNET Backend démarré");
            console.log("========================================");
            console.log(`🌍 URL : http://localhost:${PORT}`);
            console.log(`📦 Environnement : ${process.env.NODE_ENV}`);
            console.log(`🗄️ Base : ${process.env.DB_NAME}`);
            console.log("========================================");
            console.log("");

        });

    } catch (error) {

        console.error("❌ Impossible de démarrer le serveur");
        console.error(error);

        process.exit(1);

    }
}

startServer();