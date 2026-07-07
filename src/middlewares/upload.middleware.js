

const multer = require("multer");

const storage = multer.memoryStorage();


const upload = multer({

    storage,

    limits: {
        fileSize: 5 * 1024 * 1024 * 1024 // 5 Go
    },


    fileFilter: (req, file, cb) => {

        const extension = file.originalname
            .split(".")
            .pop()
            .toLowerCase();


        const allowedExtensions = [

            // Applications
            "apk",
            "xapk",
            "aab",
            "apks",
            "obb",
            "zip",

            // Images
            "jpg",
            "jpeg",
            "png",
            "webp",
            "gif"

        ];


        if (allowedExtensions.includes(extension)) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Format non accepté."
                ),
                false
            );

        }

    }

});


module.exports = upload;

