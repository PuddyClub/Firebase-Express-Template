var tinyLogoutFirebase = async function (err, callback = function (worked) { if (worked) { location.reload(); } }) {

    // Callback
    if (customFirebaseLoginRedirect && typeof customFirebaseLoginRedirect.beforeLogout === "function") { await customFirebaseLoginRedirect.beforeLogout(); }
    const failCallbackTime = async function (err) {

        if (customFirebaseLoginRedirect && typeof customFirebaseLoginRedirect.failLogout === "function") { await customFirebaseLoginRedirect.failLogout(); }
        console.error(err);
        if (customFirebaseLoginRedirect && typeof customFirebaseLoginRedirect.error === "function") { await customFirebaseLoginRedirect.error(err, 'failCallbackTimeLogout'); }
        callback(false);
        return;

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
            response.json().then(async (data) => {

                // Show Error Message
                if (!data.success) {
                    const err = new Error(data.message);
                    err.data = data;
                    await failCallbackTime(err);
                }

                // Complete
                else {
                    callback(true);
                }

                // Return
                return;

            }).catch(async err => {
                await failCallbackTime(err);
                return;
            });
        }).catch(async err => {
            await failCallbackTime(err);
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