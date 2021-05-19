<div align="center">
<p>
    <a href="https://discord.gg/TgHdvJd"><img src="https://img.shields.io/discord/413193536188579841?color=7289da&logo=discord&logoColor=white" alt="Discord server" /></a>
    <a href="https://www.npmjs.com/package/@tinypudding/firebase-express-template"><img src="https://img.shields.io/npm/v/@tinypudding/firebase-express-template.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/@tinypudding/firebase-express-template"><img src="https://img.shields.io/npm/dt/@tinypudding/firebase-express-template.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://www.patreon.com/JasminDreasond"><img src="https://img.shields.io/badge/donate-patreon-F96854.svg?logo=patreon" alt="Patreon" /></a>
    <a href="https://ko-fi.com/jasmindreasond"><img src="https://img.shields.io/badge/donate-ko%20fi-29ABE0.svg?logo=ko-fi" alt="Ko-Fi" /></a>
</p>
<p>
    <a href="https://nodei.co/npm/@tinypudding/firebase-express-template/"><img src="https://nodei.co/npm/@tinypudding/firebase-express-template.png?downloads=true&stars=true" alt="npm installnfo" /></a>
</p>
</div>

# Firebase-Express-Template
A template for website development using Firebase.

</hr>

## Example

### config.json
These are the Firebase Server settings for the @tinypudding/firebase-lib module and the domain validator from the @tinypudding/puddy-lib.
```json
{
    "options": {
        "id": "main"
    },
    "firebase": {
        "databaseURL": "example",
        "authDomain": "example.com",
        "serviceAccountId": "example@example.iam.gserviceaccount.com",
    },
    "domain": "example.com"
}
```

### firebase_web.json
These are the Firebase Client settings that are in your website.
```json
{
    "apiKey": "",
    "authDomain": "example.com",
    "projectId": "example",
    "appId": ""
}
```

### index.js
```js
// Prepare Modules
const functions = require('firebase-functions');
const tinyCfg = require('./config.json');
const expressTemplate = require('@tinypudding/firebase-express-template');

// Get a Custom Firebase Cert
const isEmulator = require('@tinypudding/firebase-lib/isEmulator');
if(isEmulator()){
    const admin = require('firebase-admin');
    tinyCfg.firebase.credential = admin.credential.cert(require('./firebase.json'));
}

// Prepare App
const app = expressTemplate({

    // File Config
    fileCfg: {
        fileMaxAge: '2592000000'
    },

    // Error Page
    errorPage: (req, res, data, cfg, firebaseWeb) => {

        // Is a Error Page
        if (res && req) {

            // Logger
            const logger = require('@tinypudding/firebase-lib/logger');

            // Prepare Result
            const result = { code: data.code };

            // Get Error Message
            if (data.message) { result.text = data.message; }
            else if (data.err && data.err.message) { result.text = data.err.message; }
            else { result.text = '???'; }

            // Log
            if (data.code !== 404) {
                let errorData = null;
                if (data.err) { errorData = data.err; }
                else if (data.message) { errorData = new Error(data.message); }
                else { errorData = new Error('Unknown Error'); }
                errorData.code = data.code;
                logger.error(errorData);
            }

            // Send Error Page
            return res.json(result);

        } 
        
        // Nothing
        else { return; }

    },

    // Website Middleware
    middleware: function (web) {
     
        // Nunjucks Module. You can use any module here.
        const path = require('path');
        const nunjucks = require('nunjucks');
        nunjucks.configure(path.join(__dirname, '../views'), {
            autoescape: true,
            express: web.app
        });

        web.app.set('view engine', 'nunjucks');

        // Homepage (web.dsSession will install the Discord Session in this page)
        web.app.get('/', web.dsSession(), (req, res) => {
            console.log(req.discord_session);
            res.render('test');
            return;
        });

        // Install Firebase Google oAuth in this page
        web.app.get('/firebasePage', web.googleFireAuth, (req, res) => {
            console.log(req.firebase_session);
            res.render('test');
            return;
        });

        // Complete
        return web.fn();
     
    },
    
    // config.json
    cfg: tinyCfg,

    // Helmet
    // https://www.npmjs.com/package/helmet
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'", "'unsafe-inline'", 'https://securetoken.googleapis.com/', 'https://www.googleapis.com/']
            }
        }
    },

    // Main
    main: {
        domainValidator: {

            // Domain Validator
            domain: tinyCfg.domain, 

            // Static Path Protector
            staticPath: ['/css/', '/img/', '/js/', '/sound/', '/webfonts/'] 

        }
    },

    // Firebase
    firebase: { options: tinyCfg.options, firebase: tinyCfg.firebase },
    firebaseWeb: require('./firebase_web.json'),

    // Cookie Session Module Settings
    // https://www.npmjs.com/package/cookie-session
    cookieSession: {
        keys: [
            "FkWS8HFZUt",
            "1EC4RdpUEQ"
        ]
    },

    // csrftoken
    // https://www.npmjs.com/package/@tinypudding/csrftoken-lib
    csrftoken: {

        // This is the path of the module method ( csrftoken(csrfToken', 1, 'hours'); )
        module: ['csrfToken', 1, 'hours'],

        // The Callback of the Csrf Token validator for all other modules of the template.
        callback: function (req) {
        
            // Prepare Result
            const result = { now: null, server: null };

            // Get Body
            if(req.body && typeof req.body.csrftoken === "string") { result.now = req.body.csrftoken; }

            // Get Server
            if(req.csrfToken && req.csrfToken.now && typeof req.csrfToken.now.value === "string") { result.server = req.csrfToken.now.value; }

            // Send Reuslt
            return result; 
        
        }

    },

    // Timezone Module (You need the module cookie-session installed)
    // https://www.npmjs.com/package/@tinypudding/timezone-cookie-session
    timezone: {
        urls: { setTime: '/setTime' },
        clock24: true,
        autoList: true,
        setSecondary: true,
        fileMaxAge: '2592000000'
    },

    // i18 Module  (You need the module cookie-session installed)
    // https://www.npmjs.com/package/@tinypudding/i18
    i18: {

        // Vars Session Names.
        cfg: {

            // Vars cookie-session.
            varsSession: {
                sessionLang: 'sessionLang',
                userLang: 'userLang',
                nowLang: 'nowLang',
                langIsUser: 'langIsUser'
            },

            // Lang List.
            list: [
                { value: 'en', name: 'English' },
                { value: 'pt-br', name: 'Português Brasil' }
            ]

        },

        // Return true or false if your web session is a logged user.
        getIsUser: function(req, res) {

            // Set the user session boolean to false
            return false;

        },

        // Get CSRF Token
        getCsrfToken: function (req, res) {
            return new Promise(function (resolve) {

                // Return csrfToken
                resolve({
                    now: '', // CSRF Token sent by the user
                    server: '' // Server CSRF Token
                });

                // Complete
                return;

            });
        },

        // URLs of the module.
        urls: {
            setLang: '/setLang'
        },

    },

    /* 
    
        Discord OAuth2 (You need the module cookie-session installed)

        If you insert a bot token and have Discord.JS (https://discord.js.org/) installed, req.discord_session.bot will return a Discord.JS Client. 
        
        Do not forget that this Discord.JS Client is not connected to webSockets so as not to allow your Firebase application to be trying to make various Websocket connections with each request on your website.

        To start Discord.JS in your application you need to call the method req.discord_session.bot().
        When this method is called, it will transform req.discord_session.bot into a Discord.JS Client.
        If the Discord.JS module is not detected, it will return the module's default methods in the req.discord_session.bot.

        https://www.npmjs.com/package/@tinypudding/discord-oauth2
    
    */
    discordOAuth2: {

        // Database to get the bot data
        database: {
            
            // Bot Path
            botPath: 'bots',

            // App Path
            appPath: 'apps',

            // Database Name
            name: 'tiny-boop',
            
            // Paths that are authorized to read the database to obtain the Auth without needing the user logged on. You can use the value "*" to allow the entire website.
            pathNoUser: [],
        
        },

        // Localhost to test
        localhost: 'localhost:5000',

        // Base
        discord: {

            // Discord URL
            url: {
                commandLogin: '/commandLogin',
                botLogin: '/botLogin',
                login: '/login',
                logout: '/logout',
                redirect: '/redirect',
                firebaseLogin: '/firebase/login',
                firebaseLogout: '/firebase/logout'
            },

            // Auth. If you don't set any database values to get the values automatically, the values written here will be used. You must at least enter the discordScope. 
            auth: {
                bot_token: '',
                client_id: '',
                client_secret: '',
                discordScope: ['identify', 'email'],
                first_get_user: true
            },

            // Crypto Key
            crypto: { key: 'tinypudding123456789012345678900' },

            // Check Auth Time
            checkAuthTime: (decodedIdToken) => {

                // Only process if the user just signed in in the last 5 minutes.
                if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
                    return true;
                }

                // Nope
                else { return false; }

            },

            // Cookie Time Generator
            cookieTimeGenerator: (decodedIdToken) => {

                // Set session expiration to 5 days.
                const expiresIn = 60 * 60 * 24 * 5 * 1000;

                // Complete
                return expiresIn;

            },

            // Configuration
            cfg: {

                // Need Email Verification to login in 
                needEmailVerified: true,

                // Firebase Login Redirect
                redirect: {

                    /* Login */
                    login: function (data, req, res, firebaseCfg, webCfg) {

                        // res.render is a Render Module from Nunjucks
                        return res.render('firebase_redirect/login', {

                            // the Firebase Web Config to insert in the page.
                            firebase_cfg: JSON.stringify(firebaseCfg),

                            // The main function string to be send to login page.
                            start_login: data.functions.run,

                            // The Firebase token to do the login.
                            token: data.token,

                            // The Csrf Token
                            key: data.key,

                            // The Final Redirect URL
                            redirect_url: data.redirect
                            
                        });

                    },

                    /* Logout */
                    logout: function (data, req, res, firebaseCfg, webCfg) {

                        // res.render is a Render Module from Nunjucks
                        return res.render('firebase_redirect/logout', {

                            // the Firebase Web Config to insert in the page.
                            firebase_cfg: JSON.stringify(firebaseCfg),

                            // The main function string to be send to logout page.
                            start_logout: data.functions.run,

                            // The Firebase token to do the login.
                            token: data.token,

                            // The Csrf Token
                            key: data.key,

                            // Firebase Key
                            original_key: data.original_key,

                            // The Final Redirect URL
                            redirect_url: data.redirect

                        });

                    },

                    /* Webhook Discord Creator Callback */
                    webhook: function (data, req, res) { return res.send(''); }

                }

            },

        }

    }

});

// Website Function
exports.example = functions.https.onRequest(app);
```

</hr>

## Firebase Google oAuth
This script was developed specifically to work with Google's Auth of Firebase.

First you need to configure your JSON data and your custom method file if you want to add anything extra to happen during the login.

### JSON Data 
```js
const JSONDATA = {

    // Vars Session
    varsSession: {
        firebase_token: "firebase_token",
        google_token: "google_token"
    },

    // URL
    url: {
        nativeLogin: "/firebase/nativeLogin.js",
        nativeLoginClient: "/firebase/nativeLoginClient.js",
        nativeLogout: "/firebase/nativeLogout.js",
        loginServer: "/firebase/loginServer",
        logoutServer: "/firebase/logoutServer",
        fireLogin: "/fireLogin"
    },

    // Login Redirect Meta
    redirectMetaPages: {
        
        // Basic Info
        login: "<script src=\"/file.js\"></script>",
        loginTitle: "Login...",
        firebaseVersion: "8.2.6",

        // Check Auth Time
        checkAuthTime: (decodedIdToken) => {

            // Only process if the user just signed in in the last 5 minutes.
            if (new Date().getTime() / 1000 - decodedIdToken.auth_time < 5 * 60) {
                return true;
            }

            // Nope
            else { return false; }

        },

        // Cookie Time Generator
        cookieTimeGenerator: (decodedIdToken) => {

            // Set session expiration to 5 days.
            const expiresIn = 60 * 60 * 24 * 5 * 1000;

            // Complete
            return expiresIn;

        }
        
    }

}

// Start App
const app = expressTemplate({

    ...

    // Insert the JSON Data here
    firebaseGoogle: JSONDATA

    ...

});
```

### /file.js
```js
var customFirebaseLoginRedirect = {

    // Before Login
    beforeLogin: (provider, type, extra) => {
        // provider - firebase.auth.GoogleAuthProvider() value
        // type - event type 
        // extra - some extra value
        return;
    },

    // Before Logout
    beforeLogout: () => {
        return;
    },

    // Fail Login
    failLogout: () => {
        return;
    },

    // Error
    failLogout: (err, id) => {
        alert(err.message);
        return;
    }

};
```

### /index.html (meta)
Now you need to add META to your page.

```html
<script>firebase.initializeApp(firebaseCfg);</script>
<script src="/firebase/nativeLoginClient.js"></script>
<script src="/firebase/nativeLogout.js"></script>
<script src="/file.js"></script>
```

The file "nativeLoginClient.js" contains the method "updateFirebaseUserToken();".
You can use this method to validate that your server token is valid. 
You can choose a custom method to run after the new token is updated.
The default method is made to reload the page.

```js
var user_token_validated_in_the_server_side = false;
firebase.auth().onAuthStateChanged(function (user) {

    // The Value is False. The new token will be added now.
    if(user && !user_token_validated_in_the_server_side) {
        updateFirebaseUserToken(user, (json) => {

            // Show Request Result
            console.log(json); 
            
            // Reload the page
            location.reload(); 
            
        });
    }

});
```

### /index.html (body)
Don't forget to add the login and logout buttons.

```html
<!-- Logout Button -->
<a id="logout" href="javascript:void(0);">
    Logout
</a>
<script>$("#logout").click(function () { tinyLogoutFirebase(); });</script>

<!-- Login Button -->
<a href="/fireLogin?redirect=homepage"> <!-- This url will redirect to /homepage -->
    Login
</a>
```