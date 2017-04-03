const passport = require('passport');

module.exports = function(app) {

    /*  Simple route middleware to ensure user is authenticated.
     Use this route middleware on any resource that needs to be protected.  If
     the request is authenticated (typically via a persistent login session),
     the request will proceed.  Otherwise, the user will be redirected to the
     login page. */
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/')
    }

    /*route to GitHub for authenticating the user*/
    app.get('/auth/github', passport.authenticate('github', {
        scope: ['repo']
    }));

    /*callback route from githut confirming the user was authenticated, if not, redirected back to the
     login page CHANGE THE '/' WHEN CHANGING THE LOGIN URL!!!!!!!!!!*/
    app.get('/auth/github/callback', passport.authenticate('github', {
            failureRedirect: '/'
        }),
        function(req, res) {
            // Successful authentication, redirect home.
            res.redirect("/#!/home");
        });

    app.get('/user', ensureAuthenticated, function(req, res) {
        res.send(req.user);
    });

};