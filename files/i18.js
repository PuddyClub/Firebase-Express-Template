module.exports = function (app, data) {

    // Module
    const tinyModule = require('@tinypudding/i18');
    const i18 = new tinyModule(app, data);

    // Install
    app.use(i18.insert(data.getIsUser));

    // Complete
    return i18;

};