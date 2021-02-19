<div align="center">
<p>
    <a href="https://discord.gg/TgHdvJd"><img src="https://img.shields.io/discord/413193536188579841?color=7289da&logo=discord&logoColor=white" alt="Discord server" /></a>
    <a href="https://www.npmjs.com/package/@tinypudding/firebase-express-template"><img src="https://img.shields.io/npm/v/@tinypudding/firebase-express-template.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/@tinypudding/firebase-express-template"><img src="https://img.shields.io/npm/dt/@tinypudding/firebase-express-template.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://www.patreon.com/JasminDreasond"><img src="https://img.shields.io/badge/donate-patreon-F96854.svg" alt="Patreon" /></a>
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
        
        // Exist Req and Res in this request? Send the error page.
        if (res && req) { return res.json(data); } 
        
        // Nope? You can work with the data values only here.
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
            res.render('test');
            return;
        });
     
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
        callback: function (req) { return { now: req.body.csrftoken, server: req.csrftoken.now.value }; }

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