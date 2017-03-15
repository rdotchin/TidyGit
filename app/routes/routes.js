const passport = require('passport');
const path = require('path');

module.exports = function(app){

	app.get('/login', function(req, res) {
		res.sendFile(path.join(__dirname + "/../../test.html"));
	});

	app.get('/home', function(req, res) {
		res.send("home page");
	});

	app.get('/auth/github', passport.authenticate('github'));

	app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),
  		function(req, res) {
  			console.log(res);
    		// Successful authentication, redirect home.
    		res.redirect('/home');
  			});


};