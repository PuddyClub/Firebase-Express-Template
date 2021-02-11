module.exports = function () {

    // Sign Out
    firebase.auth().signOut()

        // Success
        .then(() => {
            location.reload();
            return;
        })
        .catch((err) => {
            location.reload();
            return;
        });

    // Complete
    return;

};