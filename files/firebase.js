module.exports = function (cfg) {

    // Prepare Firebase Module
    const firebase = require('@tinypudding/firebase-lib');

    // Prepare Config
    const _ = require('lodash');
    const tinyCfg = _.defaultsDeep({}, cfg, {
        options: {
            id: "main"
        }
    });

    // Remove Custom Auth
    cfg.firebase = require('./firebaseJSONValidator')(cfg.firebase);

    // Start Firebase
    firebase.start(require('firebase-admin'), tinyCfg.options, tinyCfg.firebase);
    const app = firebase.get(tinyCfg.options.id);

    // Install Auth
    if (!app.auth) { app.auth = app.root.auth(); }

    // Complete
    return app;

};