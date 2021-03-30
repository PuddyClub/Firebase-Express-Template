module.exports = function (app, data) {

    // Module
    const tinyModule = require('@tinypudding/i18');
    const i18 = { app: new tinyModule(app, data) };
    i18.isUser = i18.app.insert(data.getIsUser);
    i18.isUserStarted = false;
    i18.insertIsUser = function () {

        // Install
        if (!i18.isUserStarted) { i18.isUserStarted = true; }

        // Return
        return i18.isUser;

    };

    // Install
    app.use((req, res, next) => {
        if (!i18.isUserStarted) { return i18.isUser(req, res, next); } else { next(); }
    });

    // Complete
    return i18;

};