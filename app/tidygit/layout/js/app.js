const nodegit = require("nodegit");
const execFile = require('child_process').execFile;
const request = require('request');
const fs = require('fs');
const beautify = require('js-beautify').js_beautify;
const moment = require('moment');
var simpleGit = require('simple-git'); // Used for git add -A
const rimraf = require('rimraf'); // npm package to delete directory

//GLOBAL VARIABLES
var GlobalUser;
var GlobalToken;
var GlobalRepoURL;
var GlobalRepoName;
var GlobalRepoLocal;




module.exports = /*function(repoURL, repoName, user) */{

    /* will return a list of all the users repos, invoked in passport-routes.js*/
    reposList: function(user, token, cb){
        const options = {
            'url': 'https://api.github.com/user/repos?access_token=' + token,
            'headers': {
                'User-Agent': user
            }
        };
        request(options, function(err, response, body){
            cb(body);
        })
    },


    /*CLONE THE GITHUB REPO */
    cloneRepo : function(repoURL, repoName, user) {
        //set global variables
        GlobalUser = user;
        GlobalToken = user.accessToken;
        GlobalRepoURL = repoURL;
        GlobalRepoLocal = __dirname + '/' + repoName;
        GlobalRepoName = repoName;

        var signature = nodegit.Signature.create(GlobalUser.name, GlobalUser.email, moment().unix(), 0);

        nodegit.Clone(GlobalRepoURL, GlobalRepoLocal).then(function (repository) {
            //OPEN THE REPO AND CREATE A NEW BRANCH CALLED TidyGit
            nodegit.Repository.open(GlobalRepoLocal)
                .then(function (repo) {
                    // Create a new branch on head
                    return repo.getHeadCommit()
                        .then(function (commit) {
                            return repo.createBranch(
                                "TidyGit",
                                commit,
                                0,
                                repo.defaultSignature(),
                                "Created new-branch on HEAD");
                        });
                }).done(function () {
                // once the new branch is created change to that branch
                checkoutBranch();
                /*console.log("All done!");*/

            });
        });
    }
};

/* CHECKOUT THE TIDYGIT BRANCH*/
function checkoutBranch(){

    nodegit.Repository.open(GlobalRepoLocal).then(function(repo) {
        return repo.getCurrentBranch().then(function(ref) {
            const checkoutOpts = {
                checkoutStrategy: nodegit.Checkout.STRATEGY.FORCE
            };
            return repo.checkoutBranch("TidyGit", checkoutOpts);
        }).then(function () {
            return repo.getCurrentBranch().then(function(ref) {
               /* console.log("On " + ref.shorthand() + " " + ref.target());*/
            });
        });
    }).catch(function (err) {
        console.log(err);
    }).done(function () {
        // Parse the directory
        parseDir();
        /*console.log('Finished');*/
    });
}

/*Find all files in the directory, put the files in an array, only select
  .js files and tidy the js files*/
var filesToUpdate = [];
function parseDir() {
    execFile('find', [GlobalRepoLocal], function (err, stdout, stderr) {
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
    if(!file) {
        return simpleGit(GlobalRepoLocal).raw(['add', '-A'], function() {
            githubCommit();
        });
    }
    //read the .js file and write it using js-beautify, then run the tidy function again
    fs.readFile(file, 'utf8', function (err, data) {
        fs.writeFile(file, beautify(data, {indent_size: 6}), function() {
            console.log('successful write');
            tidyNextFile();
        })
    });
}

/* After the files have run through js-beautify and git add -A this function
   will git commit -m "TidyGit"*/
function githubCommit(){
   /* console.log('githubCommit user', user);*/
    var _repository;
    var _index;
    var _oid;
    var remote;

    //open a git repo
    nodegit.Repository.open(GlobalRepoLocal)
        .then(function(repo) {
           /* console.log('commit repo', repo);*/
            _repository = repo;
            return repo.refreshIndex();
        })
        .then(function(index){
            _index = index;
        })
        .then(function() {
            return _index.write();
        })
        .then(function() {
            return _index.writeTree();
        })
        .then(function(oid) {
            /*console.log("oid");*/
            _oid = oid;
            return nodegit.Reference.nameToId(_repository, "HEAD");
        })
        .then(function(head) {
            return _repository.getCommit(head);
        })
        .then(function(parent) {
            var author = nodegit.Signature.create("Richard Dotchin",
                "richard.dotchin@gmail.com", moment().unix(), 0);
            var committer = nodegit.Signature.create("Richard Dotchin",
                "richard.dotchin@gmail.com", moment().unix(), 0);

            return _repository.createCommit("HEAD", author, committer,
                "TidyGit", _oid, [parent]);
        })
        .then(function(commitId) {
           console.log("New Commit:", commitId.allocfmt());
        })
        /// PUSH
        .then(function() {
            //invoke the git push origin TidyGit function
            pushBranch()
        });

}

// git push origin TidyGit
//FIGURE OUT WAY TO PASS IN accessToken FOR PRIVATE REPOS*****
function pushBranch(){
    /*require('simple-git')()*/
        simpleGit(GlobalRepoLocal).push(['origin', 'TidyGit:TidyGit'], function () {
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
        "body": "TidyGit has cleaned up all the JavaScript files",
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

    request.post(options, function(err, res, body){
        if (err) {
            console.log(err);
            throw err
        }
        /*console.log('headers', res.headers);*/
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