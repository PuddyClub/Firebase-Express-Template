module.exports = function (tinyCfg = {}) {

    // Year Footer
    if (typeof tinyCfg.yearFooter !== "number") { tinyCfg.yearFooter = new Date().getUTCFullYear(); }
    if (typeof tinyCfg.originalYearFooter !== "number") {
        tinyCfg.originalYearFooter = new Date().getUTCFullYear();
    }

    let yearFooter = tinyCfg.yearFooter;
    if (tinyCfg.yearFooter !== tinyCfg.originalYearFooter) {
        yearFooter = tinyCfg.originalYearFooter + " - " + tinyCfg.yearFooter;
    }

    return yearFooter;

}