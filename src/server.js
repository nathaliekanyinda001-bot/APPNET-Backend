





const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config();


// =========================
// DATABASE
// =========================
const { testConnection } = require("./config/database");


// =========================
// CLOUDINARY
// =========================
require("./config/cloudinary");


// =========================
// APP INIT
// =========================
const app = express();


// =========================
// SECURITY MIDDLEWARES
// =========================
app.use(helmet());


// =========================
// CORS CONFIGURATION
// =========================
app.use(cors({

    origin: true,

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ],

    credentials: true

}));


// Permet les requêtes OPTIONS sans erreur
app.use((req, res, next) => {

    res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    next();

});



app.use(express.json({
    limit:"20mb"
}));


app.use(express.urlencoded({
    extended:true
}));


app.use(morgan("dev"));




// =========================
// RATE LIMIT
// =========================

const apiLimiter = require("./middlewares/rateLimit.middleware");

app.use("/api", apiLimiter);





// =========================
// ROUTES IMPORTS
// =========================


// AUTH
const registerRoute = require("./Routes/Login/Register");
const loginRoute = require("./Routes/Login/login");
const createAppRoute = require("./Routes/apps/createApp");
const mediaRoute = require("./Routes/apps/uploadMedia");
const versionRoutes = require("./Routes/apps/versions");
const downloadRoute = require("./Routes/apps/download");
const myAppsRoute = require("./Routes/apps/myApps");
const getAppDetailsRoute = require("./Routes/apps/getAppDetails");
const updateAppStatus = require("./Routes/Admin/updateAppStatus");
const getPendingApps = require("./Routes/Admin/getPendingApps");
const adminAppsDashboard = require("./Routes/Admin/getAdminAppsDashboard");
const pendingAppDetails = require("./Routes/Admin/getPendingAppDetails");
const appVersionsRoutes = require("./Routes/Admin/appVersions");
//const updateAppRoute = require("./Routes/apps/updateApp");
const submitAppRoute = require("./Routes/apps/submitApp");
const approveUpdate = require("./Routes/Admin/approveUpdate");
const rejectUpdate = require("./Routes/Admin/rejectUpdate");
const publicAppsRoute = require("./Routes/public/getPublicApps");
const publicAppDetailsRoute = require("./Routes/public/getPublicAppDetails");
const sitemapRoute = require("./Routes/Public/sitemap");





// =========================
// ROUTES
// =========================


// AUTH

app.use(
    "/api/auth/register",
    registerRoute
);


app.use(
    "/api/auth/login",
    loginRoute
);




// APPS

app.use(
    "/api/apps",
    createAppRoute
);


app.use(
    "/api/apps",
    mediaRoute
);


app.use(
    "/api/apps",
    versionRoutes
);


app.use(
    "/api/apps",
    downloadRoute
);


app.use(
    "/api/apps",
    myAppsRoute
);


app.use(
    "/api/apps",
    getAppDetailsRoute
);





// ADMIN

app.use(
    "/api/admin",
    updateAppStatus
);


app.use(
    "/api/admin",
    getPendingApps
);


app.use(
    "/api/admin",
    adminAppsDashboard
);


app.use(
    "/api/admin",
    pendingAppDetails
);


app.use(
    "/api/admin/app-versions",
    appVersionsRoutes
);

//app.use("/api/apps",updateAppRoute);
app.use("/api/apps",submitAppRoute);
app.use("/api/admin", approveUpdate);
app.use("/api/admin", rejectUpdate);
app.use("/api/public",publicAppsRoute);
app.use("/api/public",publicAppDetailsRoute);
app.use("/", sitemapRoute);






// =========================
// HOME ROUTE
// =========================

app.get("/", (req,res)=>{


    res.status(200).json({

        success:true,

        message:
        "🚀 APPNET Backend API fonctionne correctement",

        version:"1.0.0"

    });


});






// =========================
// HEALTH CHECK
// =========================

app.get("/api/health",(req,res)=>{


    res.status(200).json({

        success:true,

        status:"OK",

        uptime:
        process.uptime(),

        timestamp:
        new Date()

    });


});








// =========================
// ERROR HANDLER
// =========================

app.use((err,req,res,next)=>{


    console.error(err);


    res.status(500).json({

        success:false,

        message:"Erreur serveur interne"

    });


});








// =========================
// START SERVER
// =========================

const PORT =
process.env.PORT || 5000;



async function startServer(){


    try{


        await testConnection();


        console.log(
            "🚀 DB READY - STARTING SERVER"
        );



        app.listen(PORT,()=>{


            console.log(`

==================================================
☁️ CLOUDINARY CONNECTED
🌍 Cloud Name : ${process.env.CLOUDINARY_CLOUD_NAME}
==================================================

==================================================
🚀 APPNET SERVER STARTED SUCCESSFULLY
🌍 URL : http://localhost:${PORT}
⚡ PORT : ${PORT}
📦 DATABASE : ${process.env.DB_NAME}
📅 STATUS : ONLINE
==================================================

            `);


        });



    }catch(error){


        console.error(
            "❌ DATABASE CONNECTION FAILED"
        );


        console.error(
            error.message
        );


        process.exit(1);


    }


}



startServer();

