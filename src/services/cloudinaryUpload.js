

const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Upload buffer vers Cloudinary
function uploadToCloudinary(buffer, folder, resourceType = "image") {
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resourceType
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
    });
}

module.exports = uploadToCloudinary;

