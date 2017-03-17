const passport = require('passport');
var request = require('request');

module.exports = function(app){

    /*  Simple route middleware to ensure user is authenticated.
    Use this route middleware on any resource that needs to be protected.  If
    the request is authenticated (typically via a persistent login session),
    the request will proceed.  Otherwise, the user will be redirected to the
    login page. */
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/')
    }

    /*route to GitHub for authenticating the user*/
	app.get('/auth/github', passport.authenticate('github'));

    /*callback route from githut confirming the user was authenticated, if not, redirected back to the
      login page CHANGE THE '/' WHEN CHANGING THE LOGIN URL!!!!!!!!!!*/
	app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  		function(req, res) {
    		// Successful authentication, redirect home.
    		res.redirect("/#!/home");
  			});

	// route to test if the user is logged in or not
	app.get('/home', ensureAuthenticated, function(req, res) {
	});

	// route to log out
	app.post('/logout', function(req, res) { 
		req.logOut();
		res.send(200);
	});

    /* route receiving the repo url and name that that the user would like to tidy FOR TESTING PURPOSES CURRENTLY*/
	app.post('/clean/repo', function(req, res){
	    console.log(req.body.repoUrl);
	    console.log(req.body.repoName);
	    res.send(200);
    })

};