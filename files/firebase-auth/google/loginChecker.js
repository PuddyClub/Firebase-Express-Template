// Insert User Firebase Token
var loginServerURL;
var updateFirebaseUserToken = function (user, callback = () => { location.reload(); }) {
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
                csrfToken: csrfToken,
                google_token: tinyLoginFirebase.credential.accessToken
            })
        }).then(response => {
            response.json().then((data) => {

                // Show Error Message
                if (!data.success) {
                    tinyLogoutFirebase(new Error(data.error), finalRedirect);
                } else { callback(data); }

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