module.exports = function (data) {

    // Lodash Module
    const _ = require('lodash');
    const domainValidator = require('@tinypudding/puddy-lib/http/domainValidator');
    const getUserIP = require('@tinypudding/puddy-lib/http/userIP');

    // Create Settings
    const tinyCfg = _.defaultsDeep({}, data, {
        domainValidator: {},
        invalidDomainCallback: function (req, res, next) {
            const error_page = require('@tinypudding/puddy-lib/http/HTTP-1.0');
            return error_page.send(res, 403);
        }
    });

    // Prepare Website
    const express = require('express');

    // Prepare API Base
    const app = express();

    // Install Domain Validator
    app.use(function (req, res, next) {

        // Validate Domain
        const domainResult = domainValidator(req, tinyCfg.domainValidator);

        // Insert Web Session
        req.firebase_web_session = {
            domain: domainResult.domain,
            ip: getUserIP(req, { isFirebase: true })
        };

        // Verified
        if (domainResult.verified && !domainResult.isStaticPath) {

            // Fix Redirect
            res.redirectDomain = function () {

                // Normal Domain
                let httpMode = 'https';
                if(!domainResult.domain.startsWith('localhost:')){
                    httpMode = 'http';
                }

                // Normal
                if (arguments.length < 2) {
                    return res.redirect(`${httpMode}://${domainResult.domain}${arguments[0]}`);
                }

                // Nope
                else {
                    return res.redirect(arguments[0], `${httpMode}://${domainResult.domain}${arguments[1]}`);
                }

            };

            // Next
            next();

        }

        // Nope
        else { tinyCfg.invalidDomainCallback(req, res, next); }

        // Complete
        return;

    });

    // Complete
    return app;

};