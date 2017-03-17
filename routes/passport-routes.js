const passport = require('passport');

module.exports = function(app){

    // Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login')
    }
	 
	app.get('/auth/github', passport.authenticate('github'));

	app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),
  		function(req, res) {

    		// Successful authentication, redirect home.
    		res.redirect("/#!/home");
  			});

	// route to test if the user is logged in or not
	app.get('/loggedin', function(req, res) {
		res.send(req.isAuthenticated() ? req.user : '0');
	});

	// route to log out
	app.post('/logout', function(req, res) { 
		req.logOut();
		res.send(200);
	});

	app.get('/api/user', ensureAuthenticated, function(req, res){
		console.log(req.user);
		res.send(req.user);
	})

};