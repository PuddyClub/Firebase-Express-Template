module.exports = function () {
    
    // Module
    const csrfTokenCookieSession = require('@tinypudding/csrftoken-lib/template/cookie-session');

    // Install Module
    this.app.use(csrfTokenCookieSession.apply(csrfTokenCookieSession, arguments));

    // Complete
    return;

};