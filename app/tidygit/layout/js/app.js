const execFile = require('child_process').execFile;
const request = require('request'); //request npm package for HTTP calls
const fs = require('fs'); //file system
const beautifyJS = require('js-beautify').js_beautify; //JS beautify
const beautifyCSS = require('js-beautify').css; //CSS beautify
const beautifyHTML = require('js-beautify').html; //HTML beautify
const simpleGit = require('simple-git'); // Used for git add -A
const rimraf = require('rimraf'); // npm package to delete directory
const Pusher = require('pusher'); //websockets to communicate to the client
const _ = require('lodash');
var GlobalUser, GlobalToken, GlobalRepoURL, GlobalRepoName, GlobalRepoLocal, GlobalBranchName; //user, token, repo URL, repo name, __dirname + repo name

//counters for specific files beautified to be sent back with pusher
var JScounter = 0;
var CSScounter = 0;
var HTMLcounter = 0;

//Pusher setup
const pusher = new Pusher({
    appId: '317526',
    key: 'cdd662307ca417771c70',
    secret: 'd571a85c4f5529524913'
});

//Export to repos-api.js
module.exports = {

    /* HTTP call to GitHub API to retrieve all of the users repos, function called in passport-routes.js*/
    reposList: function(user, token, cb) {
        const options = {
            'url': 'https://api.github.com/user/repos?page=1&per_page=100&affiliation=owner&access_token=' + token,
            'headers': {
                'User-Agent': user
            }
        };
        request(options, function(err, response, body) {
            cb(body); //callback
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
        GlobalBranchName = 'TidyGit' + Math.floor(Date.now() / 1000).toString();
        console.log(GlobalBranchName);
        //reset counters
        JScounter = 0;
        CSScounter = 0;
        HTMLcounter = 0;

        //git clone GlobalRepoURL
        simpleGit(__dirname + '/').clone(GlobalRepoURL, GlobalRepoLocal, function(err, results) {
            //PUSHER
            pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'clone', {
                "message": '1. ' + GlobalRepoName + ' Cloned'
            });
            createBranch();
        });
    }
};

//create branch called TidyGit and checkout that branch
function createBranch() {
    //git checkout -b TidyGit
    simpleGit(GlobalRepoLocal).checkoutLocalBranch(GlobalBranchName, function(err, response) { //ADD CURRENT TIME TO TIDYGIT BRANCH**********
        //PUSHER
        pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'branch', {
            "message": '2. TidyGit Branch Created and Checkout'

        });
        filterDir();
    })
}

/*sort all .html .css. js files into an array*/
var filesToUpdate = [];

function filterDir() {
    //find the directory
    execFile('find', [GlobalRepoLocal], function(err, stdout, stderr) {
        //PUSHER
        pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'readFiles', {
            "message": '3. Reading Files'
        });
        const allowedExtensions = ['js', 'html', 'css'];
        filesToUpdate = stdout.split('\n');
        //filter files to only include JavaScript, HTML & CSS files
        filesToUpdate = filesToUpdate.filter(function(file) {
            return _.includes(allowedExtensions, _.last(file.split('.')));
        });
        //tide the files once they are sorted into an array
        tidyNextFile();
    });
}

/* Tidy each file.  If there is no file then run the simple git command to
 git commit -A follwed by invoking the function to github commit*/
function tidyNextFile() {
    //remove the last file in the array and return that element to be beautified
    var file = filesToUpdate.pop();
    //if no file, call the git add -A function
    if (!file) {
        //send to client the number of files beautified
        pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'writeFiles', {
            "message": {
                js: '4. ' + JScounter + ' JavaScript files beautified',
                html: '5. ' + HTMLcounter + ' HTML Files Beautified',
                css: '6. ' + CSScounter + ' CSS Files Beautified'
            }
        });
        gitAdd();
    } else if (file.includes('.js')) {
        JScounter++;
        tidyFile(file, beautifyJS, 'JavaScript');
    } else if (file.includes('.html')) {
        HTMLcounter++;
        tidyFile(file, beautifyHTML, 'HTML');
    } else if (file.includes('.css')) {
        CSScounter++;
        tidyFile(file, beautifyCSS, 'CSS');
    }
}

/*read file, beautify and replace the file
   @param {string} file - the current file
   @param {function} beautifyType - beautifyJS, beautifyCSS, or beautifyHTML*/
function tidyFile(file, beautifyType) {

    fs.readFile(file, 'utf8', function(err, data) {
        fs.writeFile(file, beautifyType(data, {
            indent_size: 4
        }), function() {
            tidyNextFile();
        })
    });
}

function gitAdd() {
    return simpleGit(GlobalRepoLocal).raw(['add', '-A'], function(err, result) {
        //PUSHER
        pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'gitAdd', {
            "message": '7. git add -A'
        });
        gitCommit();
    });
}

/* After the files have run through js-beautifyJS and git add -A this function
   will git commit -m "TidyGit"*/
function gitCommit() {
    //git commit --author GlobalUser.name <GlobalUser.email> -m "TidyGit"
    simpleGit(GlobalRepoLocal)
        .addConfig('user.name', GlobalUser.name) //set local config name
        .addConfig('user.email', GlobalUser.email) //set local config email
        .commit(GlobalBranchName, {
            '--author': GlobalUser.name + ' <' + GlobalUser.email + '>'
        }, function(err, result) {
            //PUSHER
            pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'gitCommit', {
                "message": '8. git commit'
            });
            pushBranch();
        });
}

//git push origin TidyGit
function pushBranch() {
    //simpleGit git push origin TidyGit
    simpleGit(GlobalRepoLocal).push(['origin', GlobalBranchName], function(err, result) {
        //PUSHER
        pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'gitPush', {
            "message": '9. git push origin TidyGit'
        });
        githubPR(); //call Pull Request function
    });
}

// Create GitHub Pull Request for the user
function githubPR() {
    var header = {
        Authorization: 'token ' + GlobalToken,
        "User-Agent": GlobalUser.username,
        "scopes": "repo"
    };
    var body = {
        "title": "TidyGit",
        "body": "Thank you for using TidyGit",
        "head": GlobalBranchName,
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
            console.log(err);
        }
        //PUSHER
        //if successful
        if (res.statusCode < 300) {
            //respond back to pusher with success
            pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'tidySuccess', {
                "message": '10. Success: Pull Request Created'
            });
        } else {
            //else respond back to pusher with fail
            pusher.trigger(GlobalUser.username + '-' + GlobalRepoName, 'tidyFail', {
                "message": '10. Fail: Please check for outstanding Pull Request'
            });
        }
        console.log('statusCode', res.statusCode);
        deleteRepo();
    })
}

// Delete repo directory once TidyGit has finished
function deleteRepo() {
    rimraf(GlobalRepoLocal, function(err) {
        if (err) throw err;
        console.log('successfully deleted ' + GlobalRepoLocal);
    });
}