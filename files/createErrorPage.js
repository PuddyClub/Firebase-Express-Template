module.exports = function (

    // App
    app,

    // Default Error Callback
    errorCallback = (req, res, next, data) => {
        const error_page = require('@tinypudding/puddy-lib/http/HTTP-1.0');
        return error_page.send(res, data.code);
    }

) {

    // Logger
    const loggerError = function (req, res, data) {

        // Not Error 404
        if (data.code !== 404) {

            // Logger
            const logger = require('@tinypudding/firebase-lib/logger');
            logger.error(data.err);

        }

        // Return Error Callback
        return errorCallback(req, res, null, error404(req));

    };

    // Prepare Error Callback
    const errorsCallback = require('@tinypudding/puddy-lib/http/errorsCallback');

    // Error 404
    const error404 = function (req) { return { code: 404, path: req.url, originalUrl: req.originalUrl, err: new Error('not found') }; };
    app.post('*', (req, res) => { return loggerError(req, res, error404(req)); });
    app.get('*', (req, res) => { return loggerError(req, res, error404(req)); });

    // Other Errors
    app.use(errorsCallback(function (req, res, next, data) {
        return loggerError(req, res, data);
    }));

    // Complete
    return;

};