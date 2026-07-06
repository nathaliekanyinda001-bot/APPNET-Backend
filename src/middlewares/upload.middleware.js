

const multer = require("multer");

// On garde les fichiers en mémoire (pas sur disque)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB par fichier (ajuste si besoin)
    }
});

module.exports = upload;

