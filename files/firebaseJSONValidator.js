module.exports = function (cfg) {

    // Prepare Firebase Module
    const isEmulator = require('@tinypudding/firebase-lib/isEmulator');

    // Remove Custom Auth
    if(isEmulator() && !cfg.forceNotEmulator && cfg.authDomain === "string"){
        delete cfg.authDomain;
    }

    // Complete
    return cfg;

};