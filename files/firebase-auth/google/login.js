// Script Base
var tinyLoginFirebase = { auth: null, credential: null, firstTime: true };

// Redirect Final
const finalRedirect = function () {

    // Final Redirect
    let redirect = '/';
    let urlQuery = queryUrlByName('redirect', location.href);
    if (typeof urlQuery === "string") {

        // Fix URL
        if (urlQuery.startsWith('/')) { urlQuery = urlQuery.substring(1); }

        // Add Redirect
        redirect += urlQuery;

    }

    // Redirect
    location.href = redirect;

};

// Auth
var loginServerURL;
tinyLoginFirebase.auth = firebase.auth();

// Auth Redirect
tinyLoginFirebase.auth.getRedirectResult().then(async (result) => {

    // Get User
    if (result && result.user) {

        // Get Credential  
        tinyLoginFirebase.credential = result.credential;

    }

    // Complete
    return;

}).catch((error) => {
    console.error(error);
    alert(error.message);
});

// Prepare Auth State Change
const firebaseOnAuthStateChanged = async function (user) {

    // First Time
    if (tinyLoginFirebase.firstTime) {

        // No User
        if (!user) {

            // Disable First Time
            tinyLoginFirebase.firstTime = false;

            // Create Provider
            const provider = new firebase.auth.GoogleAuthProvider();

            // Exist Callback
            if (customFirebaseLoginRedirect && typeof customFirebaseLoginRedirect.beforeLogin === "function") { await customFirebaseLoginRedirect.beforeLogin(provider, 'login'); }

            // Sign In With Popup
            tinyLoginFirebase.auth.signInWithRedirect(provider);

        }

        // Credential Check
        else {

            // Exist Credential
            if (customFirebaseLoginRedirect && typeof customFirebaseLoginRedirect.beforeLogin === "function") { await customFirebaseLoginRedirect.beforeLogin(null, 'getRedirectResult'); }
            if (user && tinyLoginFirebase.credential) {

                // Disable First Time
                tinyLoginFirebase.firstTime = false;

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
                            }

                            // Complete
                            else { finalRedirect(); }

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
            }

            // Nope. Try Again
            else { setTimeout(() => { firebaseOnAuthStateChanged(user); }, 100); }

        }

    }

    // Complete
    return;

};

// Prepare Redirect
tinyLoginFirebase.auth.onAuthStateChanged(firebaseOnAuthStateChanged);