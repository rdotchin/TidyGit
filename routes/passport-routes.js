const passport = require('passport');

module.exports = function(app){

	app.get('/auth/github', passport.authenticate('github'));

	app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),
  		function(req, res) {
  			console.log(res);
    		// Successful authentication, redirect home.
    		res.redirect('/home');
  			});


};