module.exports = function (app, errorPage, vars, data, firebaseWeb, webCfg) {

    // Prepare Optional Module
    const optinalRequire = require('@tinypudding/puddy-lib/get/module');

    // Prepare Discord JS
    const Discord = optinalRequire('discord.js');
    let djs_bot;

    if (Discord) { djs_bot = new Discord.Client(); }

    // Discord Redirect
    let discord_redirect = 'http://' + data.localhost + data.discord.url.redirect;
    if (!require('@tinypudding/firebase-lib/isEmulator')()) {
        discord_redirect = `https://${data.cfg.domain}${data.discord.url.redirect}`;
    }

    // Auto Redirect
    data.discord.auth.redirect = discord_redirect;

    // Create Error Page
    if (typeof errorPage === "function") {
        if (!data.discord) { data.discord = {}; }
        if (!data.discord.cfg) { data.discord.cfg = {}; }
        data.discord.cfg.errorCallback = function (err, req, res) {
            return errorPage(req, res, err, webCfg, firebaseWeb);
        }
    }

    // Fix URL Redirect
    const authURL = require('./firebaseJSONValidator')(firebaseWeb);
    if (typeof data.discord.cfg.redirect.login === "function") {
        const loginFunction = data.discord.cfg.redirect.login;
        data.discord.cfg.redirect.login = function (data, req, res) {
            return loginFunction(data, req, res, authURL, webCfg);
        }
    }

    if (typeof data.discord.cfg.redirect.logout === "function") {
        const logoutFunction = data.discord.cfg.redirect.logout;
        data.discord.cfg.redirect.logout = function (data, req, res) {
            return logoutFunction(data, req, res, authURL, webCfg);
        }
    }

    // Prepare Lodash
    const _ = require('lodash');

    // Load Vars
    const tinyVars = _.defaultsDeep({}, vars, {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        token_type: 'token_type',
        csrfToken: 'csrfToken',
        scope: 'scope',
        token_expires_in: 'token_expires_in',
        firebase_token: 'firebase_token',
        firebase_auth_token: 'firebase_auth_token'
    });

    // Prepare Auth
    const discordAuthCfg = _.defaultsDeep({}, data.discord, {

        // Config
        cfg: { needEmailVerified: true },

        // Insert Firebase
        firebase: data.firebase,

        // URL
        url: {
            commandLogin: '/commandLogin',
            botLogin: '/botLogin',
            login: '/login',
            logout: '/logout',
            redirect: '/redirect',
            firebaseLogin: '/firebase/login',
            firebaseLogout: '/firebase/logout'
        },

        vars: tinyVars

    });

    // Prepare Firebase
    const databaseEscape = require('@tinypudding/firebase-lib/databaseEscape');
    const getDBData = require('@tinypudding/firebase-lib/getDBData');
    const forPromise = require('for-promise');
    const objType = require('@tinypudding/puddy-lib/get/objType');

    // Prepare Database
    var firebaseDatabase = _.defaultsDeep({}, data.database, {
        botPath: '/',
        appPath: '/',
        name: ''
    });

    // Install Database
    if (!data.firebase.db && data.database) { data.firebase.db = data.firebase.root.database(); }

    // Get App
    const dbCheck = {};
    if (data.database && typeof firebaseDatabase.name === "string") {

        if (typeof firebaseDatabase.appPath === "string") {
            dbCheck.app = data.firebase.db.ref(firebaseDatabase.appPath).child(databaseEscape(firebaseDatabase.name));
        }

        if (typeof firebaseDatabase.botPath === "string") {
            dbCheck.bot = data.firebase.db.ref(firebaseDatabase.botPath).child(databaseEscape(firebaseDatabase.name));
        }

    }

    // Prepare Cookie Session Template
    if (data.database) {
        app.use(async function (req, res, next) {

            // Check Path
            let allowedPath = false;
            if (Array.isArray(firebaseDatabase.pathNoUser)) {
                for (const item in firebaseDatabase.pathNoUser) {
                    if (
                        typeof firebaseDatabase.pathNoUser[item] === "string" &&
                        (req.url === firebaseDatabase.pathNoUser[item] || req.url.startsWith(firebaseDatabase.pathNoUser[item] + '?'))
                    ) {
                        allowedPath = true;
                        break;
                    }
                }
            } else if (typeof firebaseDatabase.pathNoUser === "string" && firebaseDatabase.pathNoUser === "*") {
                allowedPath = true;
            }

            // Check Auth
            let needNewAuth = false;
            if (!allowedPath) {
                for (const item in discordAuthItem.auth) {
                    if (typeof discordAuthItem.auth[item] === "string" && discordAuthItem.auth[item].length < 1 && item !== 'bot_token') {
                        needNewAuth = true;
                        break;
                    }
                }
            }

            // Validator
            if (
                allowedPath ||
                (
                    needNewAuth &&
                    (
                        (typeof req.session[discordAuthCfg.vars.access_token] === "string" && req.session[discordAuthCfg.vars.access_token].length > 0) ||
                        req.url.startsWith(discordAuthCfg.url.redirect + '?') ||
                        req.url.startsWith(discordAuthCfg.url.login + '?') ||
                        req.url.startsWith(discordAuthCfg.url.logout + '?') ||
                        req.url === discordAuthCfg.url.redirect ||
                        req.url === discordAuthCfg.url.login ||
                        req.url === discordAuthCfg.url.logout
                    )
                )
            ) {

                // Read Data
                await forPromise({ data: dbCheck }, function (item, fn, fn_error) {

                    // Get Data
                    getDBData(dbCheck[item]).then(result => {

                        // Set App
                        if (objType(result, 'object')) {

                            // App
                            if (item === "app") {

                                // Client ID
                                if (typeof result.client_id === "string") {
                                    discordAuthCfg.auth.client_id = result.client_id;
                                    discordAuthItem.auth.client_id = result.client_id;
                                    discordAuthItem.commandAuth.client_id = result.client_id;
                                } else {
                                    discordAuthCfg.auth.client_id = null;
                                    discordAuthItem.auth.client_id = null;
                                    discordAuthItem.commandAuth.client_id = null;
                                }

                                // Client Secret
                                if (typeof result.client_secret === "string") {
                                    discordAuthCfg.auth.client_secret = result.client_secret;
                                    discordAuthItem.auth.client_secret = result.client_secret;
                                    discordAuthItem.commandAuth.client_secret = result.client_secret;
                                } else {
                                    discordAuthCfg.auth.client_secret = null;
                                    discordAuthItem.auth.client_secret = null;
                                    discordAuthItem.commandAuth.client_secret = null;
                                }

                                // Public Key
                                if (typeof result.public_key === "string") {
                                    discordAuthCfg.auth.public_key = result.public_key;
                                    discordAuthItem.auth.public_key = result.public_key;
                                    discordAuthItem.commandAuth.public_key = result.public_key;
                                } else {
                                    discordAuthCfg.auth.public_key = null;
                                    discordAuthItem.auth.public_key = null;
                                    discordAuthItem.commandAuth.public_key = null;
                                }

                            }

                            // Bot
                            else if (item === "bot") {

                                // Bot Token
                                if (typeof result.token === "string") {
                                    discordAuthCfg.auth.bot_token = result.token;
                                    discordAuthItem.auth.bot_token = result.token;
                                    discordAuthItem.commandAuth.bot_token = result.token;
                                } else {
                                    discordAuthCfg.auth.bot_token = null;
                                    discordAuthItem.auth.bot_token = null;
                                    discordAuthItem.commandAuth.bot_token = null;
                                }

                            }

                        } else {

                            // App
                            if (item === "app") {

                                // Discord Cfg
                                discordAuthCfg.auth.client_id = null;
                                discordAuthCfg.auth.client_secret = null;
                                discordAuthCfg.auth.public_key = null;

                                // Discord Auth Item
                                discordAuthItem.auth.client_id = null;
                                discordAuthItem.auth.client_secret = null;
                                discordAuthItem.auth.public_key = null;

                                discordAuthItem.commandAuth.client_id = null;
                                discordAuthItem.commandAuth.client_secret = null;
                                discordAuthItem.commandAuth.public_key = null;

                            }

                            // Bot
                            else if (item === "bot") {
                                discordAuthCfg.auth.bot_token = null;
                                discordAuthItem.auth.bot_token = null;
                                discordAuthItem.commandAuth.bot_token = null;
                            }

                        }

                        // Complete
                        fn();
                        return;

                    }).catch(err => {

                        // Complete
                        fn_error(err);
                        return;

                    });

                    // Complete
                    return;

                });

            }

            // Complete
            next();
            return;

        });
    }

    // Start Discord Auth
    const discordAuthItem = require('@tinypudding/discord-oauth2/template/cookie-session')(app, discordAuthCfg);

    // Insert Functions
    app.use(function (req, res, next) {

        // Discord JS
        if (Discord) {
            req.discord_session.bot = function () {

                // Get Discord JS
                req.discord_session.bot = djs_bot;

                // Get Client
                if (req.discord_session.auth && req.discord_session.auth.app && (typeof req.discord_session.auth.app.bot_token === "string" || typeof req.discord_session.auth.app.bot_token === "number")) {
                    req.discord_session.bot.token = req.discord_session.auth.app.bot_token;
                }

                // Module
                req.discord_session.module = Discord;

            };
        }

        // Nope
        else {

            // The Functions
            req.discord_session.bot = {

                // Get User
                getUser: function (userID = '@me', version = '') {
                    return require('@tinypudding/discord-oauth2/api/getUser')(req.discord_session.auth.app.bot_token, 'Bot', userID, version);
                }

            };

        }

        // Complete
        next();
        return;

    });

    // Complete
    return function (data = {}) {
        return (req, res, next) => {
            return discordAuthItem.sessionValidator(data)(req, res, next);
        };
    };

};