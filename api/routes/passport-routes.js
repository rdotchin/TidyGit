const passport = require('passport');
const tidyGit = require('../../app/tidygit/layout/js/app.js');
const db = require('../models');
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

    // Route to get all of the users github repos
    app.get('/repos', ensureAuthenticated, function(req, res) {
        const options = {
            'url': 'https://api.github.com/user/repos?access_token=' + req.user.accessToken,
            'headers': {
                'User-Agent': 'rdotchin'
            }
        };
        // invoke function to get repos from github api in app.js
        tidyGit.reposList(req.user.username, req.user.accessToken, function(repos) {
            res.send(repos);
        });
    });

    // route to log out
    app.post('/logout', function(req, res) {
        req.logOut();
        res.send(200);
    });

    /* route receiving the repo url and name that that the user would like to tidy FOR TESTING PURPOSES CURRENTLY*/
    app.post('/clean/repo', function(req, res) {
        const userId = req.user.id;
        const repoName = req.body.repoName;
        const user = req.user;
        const repoURL = 'https://' + user.accessToken + ':x-oauth-basic@github.com/' + user.username + '/' + repoName + '.git';

        //add repo to ReposHistory table
        repoHistory(userId, repoName, req.body.URL);


        //call the TidyGit function in app.js passing in the users info, repo name and repo url
        tidyGit.cloneRepo(repoURL, repoName, user); // call function in app.js to run tidyGit

        res.sendStatus(200);
    });

    app.get('/user', ensureAuthenticated, function(req, res) {
        res.send(req.user);
    });

    app.get('/history', ensureAuthenticated, function(req, res){
        console.log(req.user.id);
        db.TidyRepos.findAll({
            include: [db.Users],
            where: {
                userId: req.user.id
            }
        }).then(function(data){
            res.json(data);
        }).catch(function(err){
            console.log(err);
        });
       /* res.redirect('/#!/history')*/
    })

};

//add repo to history table, to be used in history state
function repoHistory(userId, repoName, repoURL) {
    console.log('userId', userId);
    console.log('repoName', repoName);
    console.log('repoURL', repoURL);
    db.TidyRepos.create({
        userId: userId,
        repoName: repoName,
        URL: repoURL
    }).then(function(data){
        console.log('repoHistory updated: ', repoName)
    }).catch(function(err){
        console.log(err);
    })
}