module.exports = function (app, filePrepareCfg, firebase, vars, urls, redirectMetaPages, firebaseWeb, csrftokenCallback) {
    
    // Prepare Modules
    const _ = require('lodash');

    // Load Vars
    const tinyCfg = _.defaultsDeep({}, vars, {
        firebase_token: 'firebase_token',
        google_token: 'google_token'
    });

    // Load URLs
    const tinyURLs = _.defaultsDeep({}, urls, {
        nativeLogin: '/firebase/nativeLogin.js',
        nativeLogout: '/firebase/nativeLogout.js',
        loginServer: '/firebase/loginServer',
        logoutServer: '/firebase/logoutServer',
        fireLogin: '/fireLogin'
    });

    // Tiny Redirect
    const metaPageRedirect = _.defaultsDeep({}, redirectMetaPages, {
        login: '',
        firebaseVersion: '8.2.6',
        loginTitle: 'Login...'
    });

    // File Config
    const fileCfg = _.defaultsDeep({}, filePrepareCfg, {
        fileMaxAge: '2592000000'
    });

    // Convert Number
    if (typeof fileCfg.fileMaxAge === "string") { fileCfg.fileMaxAge = Number(fileCfg.fileMaxAge); }
    if (typeof fileCfg.fileMaxAge === "number") { fileCfg.fileMaxAge = fileCfg.fileMaxAge / 1000; }


    // Return
    return {

        // Start Firebase
        startFirebase: function () {

            // Install Auth
            if (!firebase.auth) { firebase.auth = data.firebase.root.auth(); }

            // Prepare Lodash
            const fs = require('fs');
            const path = require('path');

            // Files
            const readFile = require('@tinypudding/puddy-lib/http/fileCache');

            // Login Script
            app.get(tinyURLs.nativeLogin, function (req, res, next) {
                return readFile(
                    res, next, {
                    file: fs.readFileSync(path.join(__dirname, './login.js'), 'utf8')
                        .replace('var loginServerURL;', 'var loginServerURL = "' + tinyURLs.loginServer + '";'),
                    date: { year: 2021, month: 2, day: 11, hour: 11, minute: 17 },
                    timezone: 'America/Sao_Paulo',
                    fileMaxAge: fileCfg.fileMaxAge
                }
                );
            });

            // Fire Login
            app.get(tinyURLs.fireLogin, function (req, res, next) {
                return readFile(
                    res, next, {
                    file: fs.readFileSync(path.join(__dirname, './redirect.html'), 'utf8')
                        .replace('<meta customvalue="queryURL">', function () { return `<script>var queryUrlByName = ${require('@tinypudding/puddy-lib/get/queryUrlByName').toString()};</script>`; })
                        .replace('<meta customvalue="login">', metaPageRedirect.login)
                        .replace('<meta customvalue="title">', `<title>${metaPageRedirect.loginTitle}</title>`)
                        .replace(/\{\{firebase_version\}\}/g, metaPageRedirect.firebaseVersion)
                        .replace('<script>firebase.initializeApp();</script>', `<script>firebase.initializeApp(${JSON.stringify(firebaseWeb)});</script>`)
                        .replace('<meta customvalue="nativeLogin">', `<script src="${tinyURLs.nativeLogin}"></script>`)
                        .replace('<meta customvalue="csrfToken">', `<script>var csrfToken = \`${csrftokenCallback(req).server}\`;</script>`)
                        .replace('<meta customvalue="nativeLogout">', `<script src="${tinyURLs.nativeLogout}"></script>`),
                    date: { year: 2021, month: 2, day: 11, hour: 11, minute: 17 },
                    timezone: 'America/Sao_Paulo',
                    contentType: 'text/html',
                    fileMaxAge: fileCfg.fileMaxAge
                }
                );
            });

            app.post(tinyURLs.loginServer, function (req, res) {

                // Check Code
                const csrfTokenCheck = require('@tinypudding/puddy-lib/http/csrfTokenAnalyze');
                if (csrfTokenCheck(req, res)) { return; }

                // Complete
                req.session[tinyCfg.firebase_token] = req.body.token;
                req.session[tinyCfg.google_token] = req.body.google_token;
                res.json({ success: true });
                return;

            });

            app.post(tinyURLs.logoutServer, function (req, res) {

                // Check Code
                console.log(req.firebase_session);

                // Check Code
                const csrfTokenCheck = require('@tinypudding/puddy-lib/http/csrfTokenAnalyze');
                if (csrfTokenCheck(req, res)) { return; }

                // Revoke Refresh
                if (req.firebase_session && typeof req.firebase_session.uid === "string" || typeof req.firebase_session.uid === "number") {

                    // Normal Logout
                    if (!req.body.revokeAll) {
                        req.session = null;
                        res.json({ success: true });
                    }

                    // Logout All
                    else {

                        firebase.auth
                            .revokeRefreshTokens(req.firebase_session.uid)
                            .then(() => {
                                req.session = null;
                                res.json({ success: true });
                                return;
                            }).catch(err => {
                                req.session = null;
                                res.json({ success: false, code: err.code, message: err.message });
                                return;
                            });

                    }

                }

                // Nope
                else {
                    res.json({ success: false, code: 401, message: 'You are not logged into an account.' });
                }

                // Complete
                return;

            });

            // Logout Script
            app.get(tinyURLs.nativeLogout, function (req, res, next) {
                return readFile(
                    res, next, {
                    file: fs.readFileSync(path.join(__dirname, './logout.js'), 'utf8')
                        .replace('var logoutServerURL;', 'var logoutServerURL = "' + tinyURLs.logoutServer + '";'),
                    date: { year: 2021, month: 2, day: 11, hour: 11, minute: 17 },
                    timezone: 'America/Sao_Paulo',
                    fileMaxAge: fileCfg.fileMaxAge
                }
                );
            });

            // Complete
            return;

        },

        // App Use
        appUse: function () {

            // Prepare Base
            app.use((req, res, next) => {

                // Prepare Auth
                if (typeof req.session[tinyCfg.firebase_token] === "string") {
                    firebase.auth.verifyIdToken(req.session[tinyCfg.firebase_token])

                        // Complete
                        .then((decodedToken) => {

                            // Add Firebase Session
                            req.firebase_session = decodedToken;

                            // Complete
                            next();
                            return;

                        }).catch((err) => {

                            // Delete Token
                            delete req.session[tinyCfg.firebase_token];

                            // Complete
                            next();
                            return;

                        });

                }

                // Nope
                else { next(); }

                // Complete
                return;

            });

            // Complete
            return;

        }

    };
};