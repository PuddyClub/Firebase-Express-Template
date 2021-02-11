module.exports = function (app, data, installCookies = true) {

    // Prepare Module
    const cookieSession = require('cookie-session');

    // Lodash Module
    const _ = require('lodash');

    // Create Settings
    const tinyCfg = _.defaultsDeep({}, data, {
        name: '__session'
    });

    // Create Cookie Session
    const cookieApp = cookieSession(tinyCfg);

    // Install Cookies
    if (installCookies) { app.use(cookieApp); }

    // Complete
    return cookieApp;

};