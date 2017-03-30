const execFile = require('child_process').execFile;
const request = require('request');
const fs = require('fs');
const beautify = require('js-beautify').js_beautify;
const moment = require('moment');
const simpleGit = require('simple-git'); // Used for git add -A
const rimraf = require('rimraf'); // npm package to delete directory
const Pusher = require('pusher');

const pusher = new Pusher({
    appId: '317526',
    key: 'cdd662307ca417771c70',
    secret: 'd571a85c4f5529524913'
});



//GLOBAL VARIABLES
var GlobalUser;
var GlobalToken;
var GlobalRepoURL;
var GlobalRepoName;
var GlobalRepoLocal;


module.exports = {

    /* will return a list of all the users repos, invoked in passport-routes.js*/
    reposList: function(user, token, cb) {
        const options = {
            'url': 'https://api.github.com/user/repos?access_token=' + token,
            'headers': {
                'User-Agent': user
            }
        };
        request(options, function(err, response, body) {
            cb(body);
        })
    },


    /*CLONE GITHUB REPO */
    cloneRepo: function(repoURL, repoName, user) {
        console.log('cloneRepo');
        //set global variables
        GlobalUser = user;
        GlobalToken = user.accessToken;
        GlobalRepoURL = repoURL;
        GlobalRepoLocal = __dirname + '/' + repoName;
        GlobalRepoName = repoName;

        //SIMPLEGIT CLONE REPO
        simpleGit(__dirname + '/').clone(GlobalRepoURL, GlobalRepoLocal, function(results) {
            console.log('simplegit clone');
            //PUSHER
            pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'clone', {
                "message": GlobalRepoName + ' Cloned'
            });
            createBranch();
        });
    }
};

//create branch called TidyGit and checkout that branch
function createBranch() {
    //SIMPLEGIT CREATE AND CHECKOUT BRANCH
    simpleGit(GlobalRepoLocal).checkoutLocalBranch('TidyGit', function(response) {
        console.log('checked out new branch');
        //PUSHER
        pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'branch', {
            "message": 'TidyGit Branch Created and Checkout'
        });
        parseDir()
    })
}

/*Find all files in the directory, put the files in an array, only select
  .js files and tidy the js files*/
var filesToUpdate = [];

function parseDir() {

    execFile('find', [GlobalRepoLocal], function(err, stdout, stderr) {
        //PUSHER
        pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'readFiles', {
            "message": 'Reading Files'
        });

        filesToUpdate = stdout.split('\n');
        filesToUpdate = filesToUpdate.filter(function(file) {
            return file.includes(".js") && !file.includes("bower")
        });

        tidyNextFile();
    });
}

/* Tidy each .js file.  If there is no file then run the simple git command to
   git commit -A follwed by invoking the function to github commit*/
function tidyNextFile() {
    var file = filesToUpdate.pop();
    //if no file, git add -A then invoke the git commit function
    if (!file) {
        //PUSHER
        pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'writeFiles', {
            "message": 'Files Beautified'
        });
        return simpleGit(GlobalRepoLocal).raw(['add', '-A'], function() {
            //PUSHER
            pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'gitAdd', {
                "message": 'git add -A'
            });
            githubCommit();
        });
    }
    //read the .js file and write it using js-beautify, then run the tidy function again
    fs.readFile(file, 'utf8', function(err, data) {
        fs.writeFile(file, beautify(data, {
            indent_size: 4
        }), function() {
            console.log('successful write');
            tidyNextFile();
        })
    });
}

/* After the files have run through js-beautify and git add -A this function
   will git commit -m "TidyGit"*/
function githubCommit() {
    //SIMPLEGIT GIT COMMIT
    simpleGit(GlobalRepoLocal).commit('TidyGit', function() {
        //PUSHER
        pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'gitCommit', {
            "message": 'git commit'
        });
        console.log('git commit');
        pushBranch();
    });
}

// git push origin TidyGit
//FIGURE OUT WAY TO PASS IN accessToken FOR PRIVATE REPOS*****
function pushBranch() {
    //simpleGit git push origin TidyGit
    simpleGit(GlobalRepoLocal).push(['origin', 'TidyGit:TidyGit'], function() {
        //PUSHER
        pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'gitPush', {
            "message": 'git push origin TidyGit'
        });
        console.log('push branch done');
        githubPR();
    });

}
// function for github pull request
function githubPR() {
    var header = {
        Authorization: 'token ' + GlobalToken,
        "User-Agent": GlobalUser.username,
        "scopes": "repo"
    };
    var body = {
        "title": "TidyGit",
        "body": "![](https://media.giphy.com/media/gBOmoFv3SAlLG/giphy.gif)",
        "head": "TidyGit",
        "base": "master"
    };
    var url = "https://api.github.com/repos/" + GlobalUser.username + "/" + GlobalRepoName + "/pulls";
    var options = {
        method: 'post',
        headers: header,
        body: body,
        json: true,
        url: url
    };

    request.post(options, function(err, res, body) {
        if (err) {
            throw err;
        }

        //PUSHER
        //if successful
        if (res.statusCode < 300) {
            //respond back to pusher with success
            pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'tidy-success', {
                "message": res.statusCode
            });
        } else {
            //else respond back to pusher with fail
            pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'tidy-fail', {
                "message": res.statusCode
            });
        }

        console.log('statusCode', res.statusCode);
        deleteRepo();
        /* console.log('body', body);*/
    })
}

// Delete repo directory once TidyGit has finished
function deleteRepo() {
    rimraf(GlobalRepoLocal, function(err) {
        if (err) throw err;
        console.log('successfully deleted ' + GlobalRepoLocal);
    });
}