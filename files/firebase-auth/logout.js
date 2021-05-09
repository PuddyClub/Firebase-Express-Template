var tinyLogoutFirebase = async function (err, callback = function (worked) { if (worked) { location.reload(); } }) {

    // Callback
    if (customFirebaseLoginRedirect && typeof customFirebaseLoginRedirect.beforeLogout === "function") { await customFirebaseLoginRedirect.beforeLogout(); }
    const failCallbackTime = function (err, errMessage) {

        if (customFirebaseLoginRedirect && typeof customFirebaseLoginRedirect.failLogout === "function") { customFirebaseLoginRedirect.failLogout(); }
        console.error(err);
        alert(errMessage);
        callback(false);

    };

    // Logout Action
    var logoutServerURL;
    const logoutAction = function () {

        // Fetch
        fetch(logoutServerURL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                csrfToken: csrfToken,
                revokeAll: false
            })
        }).then(async response => {
            response.json().then((data) => {

                // Show Error Message
                if (!data.success) {
                    failCallbackTime(data, data.message);
                }

                // Complete
                else {
                    callback(true);
                }

                // Return
                return;

            }).catch(err => {
                failCallbackTime(err, err.message);
                return;
            });
        }).catch(err => {
            failCallbackTime(err, err.message);
            return;
        });
        return;

    };

    // Error
    if (err) {
        failCallbackTime(err, err.message);
    }

    // Sign Out
    firebase.auth().signOut()

        // Success
        .then(() => {
            logoutAction();
            return;
        })
        .catch((err) => {
            failCallbackTime(err, err.message);
            return;
        });

    // Complete
    return;

};