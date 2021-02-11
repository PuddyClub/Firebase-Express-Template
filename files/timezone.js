module.exports = function (app, data, csrftoken) {

    // Module
    const timezoneModule = require('@tinypudding/timezone-cookie-session');
    const timezone = new timezoneModule(app, data, csrftoken);

    // Install
    app.use(timezone.insert());

    // Complete
    return timezone;

};