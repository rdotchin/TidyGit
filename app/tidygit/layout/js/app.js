const nodegit = require("nodegit"); // Used to clone github repos
const execFile = require('child_process').execFile;
const request = require('request');
const fs = require('fs');
const beautify = require('js-beautify').js_beautify;
const moment = require('moment');
const path = require('path');
var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));
fse.ensureDir = promisify(fse.ensureDir);
var simpleGit = require('simple-git');


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
        var signature = nodegit.Signature.create(user.name, user.email, moment().unix(), 0);

        nodegit.Clone(repoURL, __dirname + '/' + repoName).then(function (repository) {
            //OPEN THE REPO AND CREATE A NEW BRANCH CALLED TidyGit
            nodegit.Repository.open(__dirname + '/' + repoName)
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
                checkoutBranch(repoName, user, repoURL);
                /*console.log("All done!");*/

            });
        });
    }
};

/* CHECKOUT THE TIDYGIT BRANCH*/
function checkoutBranch(repoName, user, repoURL){

    nodegit.Repository.open(__dirname + '/' + repoName).then(function(repo) {
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
        parseDir(repoName, user, repoURL);
        /*console.log('Finished');*/
    });
}

/*Find all files in the directory, put the files in an array, only select
  .js files and tidy the js files*/
var filesToUpdate = [];
function parseDir(repoName, user, repoURL) {
    execFile('find', [__dirname + '/' + repoName], function (err, stdout, stderr) {
        filesToUpdate = stdout.split('\n');
        filesToUpdate = filesToUpdate.filter(function(file) {
            return file.includes(".js") && !file.includes("bower")
        });

        tidyNextFile(repoName, user, repoURL);
    });
}

/* Tidy each .js file.  If there is no file then run the simple git command to
   git commit -A follwed by invoking the function to github commit*/
function tidyNextFile(repoName, user, repoURL) {
    var file = filesToUpdate.pop();
    //if no file, git add -A then invoke the git commit function
    if(!file) {
        return simpleGit(__dirname + '/' + repoName).raw(['add', '-A'], function() {
            githubCommit(__dirname + '/' + repoName, user, repoURL);
        });
    }
    //read the .js file and write it using js-beautify, then run the tidy function again
    fs.readFile(file, 'utf8', function (err, data) {
        fs.writeFile(file, beautify(data, {indent_size: 6}), function() {
            console.log('successful write');
            tidyNextFile(repoName, user, repoURL);
        })
    });
}

/* After the files have run through js-beautify and git add -A this function
   will git commit -m "TidyGit"*/
function githubCommit(repoName, user, repoURL){
   /* console.log('githubCommit user', user);*/
    var _repository;
    var _index;
    var _oid;
    var remote;

    //open a git repo
    nodegit.Repository.open(repoName)
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
            pushBranch(repoName, user, repoURL)
        });

}

// git push origin TidyGit
//FIGURE OUT WAY TO PASS IN accessToken FOR PRIVATE REPOS*****
function pushBranch(repoName, user, repoURL){
    /*require('simple-git')()*/
        simpleGit(repoName).push(['origin', 'TidyGit:TidyGit'], function () {
            console.log('push branch done');
        });

}
// function for github pull request
function githubPR(repoName, user) {
    console.log('GITHUBPR ==================================\N');
    console.log('repoName', repoName);
    console.log(user);
    var options = {
        /*'https://api.github.com/repos/rdotchin/' + repoName + '/pulls'*/
        'url': 'https://api.github.com/repos/rdotchin/testfile/pulls',

        'headers': {
            'Authorization': user.accessToken,
            'User-Agent': 'rdotchin',
            'title': 'TidyGit',
            'body': 'Pull this in!',
            'head': 'TidyGit',
            'base': 'master'

        }
    };
   /* console.log(user.accessToken);
    request.post(options, function(err, httpResponse, body){
        console.log("githubPR, http code", httpResponse);

        /!*console.log(httpResponse);*!/
        console.log(body);
    })*/
}

// function to delete repo dir
function deleteRepo(file) {

}