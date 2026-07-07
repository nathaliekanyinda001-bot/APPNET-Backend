

const multer = require("multer");

// Stockage en mémoire
const storage = multer.memoryStorage();

// Types de fichiers autorisés
const allowedMimeTypes = [
  // Android
  "application/vnd.android.package-archive", // APK
  "application/octet-stream",                // APK/XAPK/APKS/OBB (selon le navigateur)
  "application/zip",                         // ZIP
  "application/x-zip-compressed",            // ZIP Windows

  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/gif",
];

// Vérification du fichier
const fileFilter = (req, file, cb) => {
  const extension = file.originalname
    .split(".")
    .pop()
    .toLowerCase();

  const allowedExtensions = [
    "apk",
    "xapk",
    "apks",
    "aab",
    "obb",
    "zip",
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
  ];

  if (
    allowedMimeTypes.includes(file.mimetype) ||
    allowedExtensions.includes(extension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Type de fichier non autorisé. Formats acceptés : APK, XAPK, APKS, AAB, OBB, ZIP, JPG, PNG, WEBP, GIF."
      ),
      false
    );
  }
};

// Limite de taille : 5 Go
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5 Go
  },
});

module.exports = upload;


