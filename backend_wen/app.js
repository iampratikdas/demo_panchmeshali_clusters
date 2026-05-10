//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import Default
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const express = require("express");
const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit');
// const cron = require("node-cron");
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger.js');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const fetch = require('node-fetch');
const cron = require('node-cron');



// const { Userschema } = require("./models/monogdb/User.js");
const SetupDatabase = require("./db/mongodb/setupDatabase.js");
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//Import

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const Route = require("./Route/Route.js");
const MethodCheck = require("./middlewares/MethodCheck");

// var db;
class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        // Expose io to routes/controllers
        this.app.set('io', this.io);

        this.app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

        this.port = process.env.PORT || 5000;
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //SetupMiddlewares
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    setupMiddlewares() {
        const publicPath = path.join(__dirname, "public");
        if (!fs.existsSync(publicPath)) {
            fs.mkdirSync(publicPath, { recursive: true });
            console.log("Public folder created");
        }
        const limiter = rateLimit({
            windowMs: 1 * 60 * 1000, // within 1 minute
            max: 100, // Limiting each IP to 100 requests per windowMs from app/web
            message: 'Too many requests, please try again later.',
        });
        this.app.use(limiter);
        this.app.use("/public", express.static(publicPath));
        this.app.use(cors({
            origin: "*",
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            // credentials: true,
        }));
        // Schedule a task to run every minute
        // cron.schedule("*/10 * * * *", () => {
        //   console.log("⏰ Task is running every minute!", new Date().toLocaleTimeString());
        // });
        this.app.use(session({ secret: 'SECRET', resave: false, saveUninitialized: true }));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        passport.serializeUser((user, done) => done(null, user));

        passport.deserializeUser((user, done) => done(null, user));

        passport.use('google-admin', new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8600/api/auth/google/callback/mobile',
        },
            (accessToken, refreshToken, profile, done) => {
                // Here you can save or find the user in your database

                return done(null, profile);
            }
        ));
        passport.use('google', new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8600/api/auth/google/callback',
        },
            (accessToken, refreshToken, profile, done) => {
                // Here you can save or find the user in your database
                // console.log("profile==========>",  accessToken, refreshToken)
                return done(null, profile);
            }
        ));

        this.app.get('/api/auth/google',
            passport.authenticate('google', { scope: ['profile', 'email'] })
            , (req, res, next) => next(req)
        );
        this.app.get('/api/auth/google/mobile',
            passport.authenticate('google-admin', { scope: ['profile', 'email',] })
        );



        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(MethodCheck.validate());
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //SetupDatabase
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    async setupDatabase() {
        await SetupDatabase.UserDbSetup(process.env.MONGO_URI);
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //SetupRoutes
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    setupRoutes() {
        const route = new Route();
        this.app.use("/api", route.router);
        
        // Initialize socket events
        const setupChatSockets = require("./socket/chat.socket.js");
        setupChatSockets(this.io);
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //Start
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    start() {
        this.server.listen(this.port, () => {
            console.log(`Server running on http://localhost:${this.port}`);
        });
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //Run
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    async run() {
        this.setupMiddlewares();
        await this.setupDatabase();
        await this.setupRoutes();
        this.start();
    }
}
//START THE SERVER
module.exports = { Server };