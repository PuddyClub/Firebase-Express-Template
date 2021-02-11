module.exports = function (user, csrfToken, callback) {

    // Final Result
    const final_redirect = function (err, data) {

        // Callback
        if (typeof callback === "function") { callback(err, data); }

        // Complete
        return;

    };

    // User Exist
    if (user) {
        user.getIdToken().then(function (idToken) {

            // Fetch
            fetch('/tinyPuddyFirebase/loginServer', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: idToken, csrfToken: csrfToken })
            }).then(response => {
                response.json().then((data) => {

                    // Show Error Message
                    if (!data.success) {
                        final_redirect(new Error(data.error));
                    }

                    // Complete
                    else {
                        final_redirect(null, user);
                    }

                    // Return
                    return;

                }).catch(err => {
                    final_redirect(err);
                    return;
                });
            }).catch(err => {
                final_redirect(err);
                return;
            });

        }).catch(err => {
            final_redirect(err);
            return;
        });
    }

    // Complete
    return;

};