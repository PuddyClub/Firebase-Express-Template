module.exports = function (app, data) {

    // Helmet
    const helmet = require("helmet");
    app.use(helmet(data));

    // Complete
    return;

};