


const {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand
} = require("@aws-sdk/client-s3");

const { Upload } = require("@aws-sdk/lib-storage");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const path = require("path");

require("dotenv").config();


// ======================================================
// CONFIGURATION IDRIVE E2
// ======================================================

const s3 = new S3Client({

  region: process.env.IDRIVE_REGION,

  endpoint: process.env.IDRIVE_ENDPOINT,

  credentials: {

    accessKeyId: process.env.IDRIVE_ACCESS_KEY,

    secretAccessKey: process.env.IDRIVE_SECRET_KEY

  }

});




// ======================================================
// UPLOAD FICHIER
// APK / XAPK / AAB / IMAGES
// ======================================================

const uploadFile = async (
  file,
  folder = "apps"
) => {


  try {


    const extension = path
      .extname(file.originalname);



    const fileName =
      folder +
      "/" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2,10) +
      extension;




    const upload = new Upload({

      client:s3,


      params:{


        Bucket:process.env.IDRIVE_BUCKET,


        Key:fileName,


        Body:file.buffer,


        ContentType:file.mimetype


      }


    });



    await upload.done();




    return {


      success:true,


      key:fileName,


      url:
      `${process.env.IDRIVE_ENDPOINT}/${process.env.IDRIVE_BUCKET}/${fileName}`


    };



  } catch(error){


    console.error(
      "Erreur upload IDrive :",
      error
    );


    return {


      success:false,


      error


    };


  }


};







// ======================================================
// GENERER URL DE TELECHARGEMENT SECURISEE
// APK / XAPK / AAB
// ======================================================

const generateDownloadUrl = async (

  key

) => {


  try {



    const command = new GetObjectCommand({


      Bucket:process.env.IDRIVE_BUCKET,


      Key:key



    });





    const url = await getSignedUrl(

      s3,

      command,

      {

        expiresIn:3600 // 1 heure

      }


    );




    return url;



  } catch(error){



    console.error(

      "Erreur génération URL IDrive :",

      error

    );



    return null;



  }



};







// ======================================================
// SUPPRIMER UN FICHIER
// ======================================================

const deleteFile = async (

  key

)=>{


  try {



    await s3.send(

      new DeleteObjectCommand({

        Bucket:
        process.env.IDRIVE_BUCKET,


        Key:key


      })

    );



    return true;



  } catch(error){



    console.error(

      "Erreur suppression IDrive :",

      error

    );


    return false;



  }


};







// ======================================================
// EXPORT
// ======================================================

module.exports = {


  uploadFile,


  generateDownloadUrl,


  deleteFile


};


