const passport = require('passport');
const tidyGit = require('../app/tidygit/layout/js/app.js');

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
	app.get('/auth/github', passport.authenticate('github', {scope: ['repo']}));

    /*callback route from githut confirming the user was authenticated, if not, redirected back to the
      login page CHANGE THE '/' WHEN CHANGING THE LOGIN URL!!!!!!!!!!*/
	app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  		function(req, res) {
    		// Successful authentication, redirect home.
    		res.redirect("/#!/home");
  			});

	// Route to get all of the users github repos
	app.get('/repos', ensureAuthenticated, function(req, res) {
        const options = {
            'url': 'https://api.github.com/user/repos?access_token=' + req.user.accessToken,
            'headers': {
                'User-Agent': 'rdotchin'
            }
        };
        // invoke function from app.js
		tidyGit.reposList(req.user.username, req.user.accessToken, function(repos){
            res.send(repos);
		});
	});

	// route to log out
	app.post('/logout', function(req, res) { 
		req.logOut();
		res.send(200);
	});

    /* route receiving the repo url and name that that the user would like to tidy FOR TESTING PURPOSES CURRENTLY*/
	app.post('/clean/repo', function(req, res){
	    /*var repoURL = req.body.repoUrl;*/
        var repoName = req.body.repoName;
        const user = req.user;
        var repoURL = 'https://' + user.accessToken + ':x-oauth-basic@github.com/' + user.username + '/' + repoName + '.git';

	    tidyGit.cloneRepo(repoURL, repoName, user); // call function in app.js to run tidyGit
        /*tidyGit.cloneRepo(repoURL, repoName, user, function(stausNumber){
            res.sendstatus(statusNumber);
            in angular....if(201) send success, else something went wrong
        }*/
	    res.sendStatus(200);
    });

    app.get('/user', ensureAuthenticated, function(req, res){
        res.send(req.user);
        });

};