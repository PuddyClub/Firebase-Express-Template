module.exports = function (app, filePrepareCfg, firebase, vars) {

    // Install Auth
    if (!firebase.auth) { firebase.auth = data.firebase.root.auth(); }

    // Prepare Lodash
    const _ = require('lodash');

    // Load Vars
    const sessionVars = _.defaultsDeep({}, vars, {
        firebase_token: 'firebase_token'
    });

    // File Config
    const fileCfg = _.defaultsDeep({}, filePrepareCfg, {
        fileMaxAge: '2592000000'
    });

    // Convert Number
    if (typeof fileCfg.fileMaxAge === "string") { fileCfg.fileMaxAge = Number(fileCfg.fileMaxAge); }
    if (typeof fileCfg.fileMaxAge === "number") { fileCfg.fileMaxAge = fileCfg.fileMaxAge / 1000; }

    // Files
    const readFile = require('@tinypudding/puddy-lib/http/fileCache');

    // Login Script
    app.get('/tinyPuddyFirebase/login.js', function (req, res, next) {
        return readFile(
            res, next, {
            file: 'var tinyPuddyLoginScript = ' + require('./login') + ';',
            date: { year: 2021, month: 2, day: 11, hour: 11, minute: 17 },
            timezone: 'America/Sao_Paulo',
            fileMaxAge: fileCfg.fileMaxAge
        }
        );
    });

    app.post('/tinyPuddyFirebase/loginServer', function (req, res) {

        // Check Code
        if (req.csrfToken && typeof req.csrfToken.now === "string" && (typeof req.body.csrfToken !== "string" || req.body.csrfToken !== req.csrfToken.now)) {
            res.status(401); res.json({ code: 401, text: 'CSRFToken!' });
            return;
        }

        // Complete
        req.session[sessionVars.firebase_token] = req.body.token;
        res.json({ success: true });
        return;

    });

    // Logout Script
    app.get('/tinyPuddyFirebase/logout.js', function (req, res, next) {
        return readFile(
            res, next, {
            file: require('./logout') + '();',
            date: { year: 2021, month: 2, day: 11, hour: 11, minute: 17 },
            timezone: 'America/Sao_Paulo',
            fileMaxAge: fileCfg.fileMaxAge
        }
        );
    });

    // Prepare Base
    const validatorBase = (req, res, next) => {

        // Prepare Auth
        if (typeof req.session[sessionVars.firebase_token] === "string") {
            firebase.auth.verifyIdToken(req.session[sessionVars.firebase_token])

                // Complete
                .then((decodedToken) => {

                    // Add Firebase Session
                    req.firebase_session = decodedToken;

                    // Complete
                    next();
                    return;

                }).catch((err) => {

                    // Delete Token
                    delete req.session[sessionVars.firebase_token];

                    // Insert Client Code to do the logout in Client Side
                    req.firebaseRunClientScript = '<script src="/tinyPuddyFirebase/logout.js"></script>';

                    // Complete
                    next();
                    return;

                });
        }

        // Nope
        else {

            // Insert Client Code to do the login in client side and get the req.session[sessionVars.firebase_token].
            req.firebaseWebClient = req.firebaseRunClientScript = '<script src="/tinyPuddyFirebase/login.js"></script>';

            // Next
            next();

        }

        // Complete
        return;

    };

    // Complete
    return function () { return validatorBase; };

};