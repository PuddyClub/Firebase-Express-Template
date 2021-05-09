// Insert User Firebase Token
var loginServerURL;
var updateFirebaseUserToken = function (user, callback = () => { location.reload(); }) {

    // Error Result
    const finalRedirect = (success) => { return callback(new Error('Fail Logout'), { success: success }); };

    // Get Token
    user.getIdToken().then(function (idToken) {

        // Fetch
        fetch(loginServerURL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: idToken,
                csrfToken: csrfToken
            })
        }).then(response => {
            response.json().then((data) => {

                // Show Error Message
                if (!data.success) {
                    tinyLogoutFirebase(new Error(data.error), finalRedirect);
                } else { callback(null, data); }

                // Return
                return;

            }).catch(err => {
                tinyLogoutFirebase(err, finalRedirect);
                return;
            });
        }).catch(err => {
            tinyLogoutFirebase(err, finalRedirect);
            return;
        });

    }).catch(err => {
        tinyLogoutFirebase(err, finalRedirect);
        return;
    });
};