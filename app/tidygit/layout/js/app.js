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



    cloneRepo : function(repoURL, repoName, user) {
        var signature = nodegit.Signature.create(user.name, user.email, moment().unix(), 0);

        /* CLONE THE GITHUB REPO */
        nodegit.Clone(repoURL, repoName).then(function (repository) {
            //OPEN THE REPO AND CREATE A NEW BRANCH CALLED TidyGit
            nodegit.Repository.open('./' + repoName)
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
                checkoutBranch(repoName, user, repoURL);
                console.log("All done!");

            });
        });
    }
};

/* CHECKOUT THE TIDYGIT BRANCH*/
function checkoutBranch(repoName, user, repoURL){

    nodegit.Repository.open('./' + repoName).then(function(repo) {
        return repo.getCurrentBranch().then(function(ref) {
            const checkoutOpts = {
                checkoutStrategy: nodegit.Checkout.STRATEGY.FORCE
            };
            return repo.checkoutBranch("TidyGit", checkoutOpts);
        }).then(function () {
            return repo.getCurrentBranch().then(function(ref) {
                console.log("On " + ref.shorthand() + " " + ref.target());
            });
        });
    }).catch(function (err) {
        console.log(err);
    }).done(function () {
        parseDir(repoName, user, repoURL);
        console.log('Finished');
    });
}

//find all files in github repo
function parseDir(repoName, user, repoURL) {
    console.log('parseDir user', user);
    execFile('find', [repoName], function (err, stdout, stderr) {
        //split the results with a space
        /*console.log(repoName + " parsed");*/
        var fileList = stdout.split('\n');

        //for each file search if it includes .js and doesn't include bower(to reduce results)
        fileList.forEach(function (file) {
            if (file.includes(".js") && !file.includes("bower")) {
                //call function to beautify the js file
                beautifyFile(repoName, user, repoURL, file);
            }

        });

    });
}

function gitAdd(repoName, user, repoURL){
    simpleGit('./' + repoName).raw(['add', '-A'], function(err, result){
        if(err) throw err;
        console.log("git add -A", result);
        githubCommit(repoName, user, repoURL);
    })
}

/*Read js file, beautify the file, replace the file*/
function beautifyFile(repoName, user, repoURL, file) {
    //read js file
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        /* Beautify the foo.js file and replace it*/
        fs.writeFile(file, beautify(data, {indent_size: 6}, function(err) {
            if (err) throw err;
        }))
    });
    gitAdd(repoName, user, repoURL);
    //call function to create a github pull request
}

// Create a repo commit
function githubCommit(repoName, user, repoURL){
    console.log('githubCommit user', user);
    var _repository;
    var _index;
    var _oid;
    var remote;

    //open a git repo
    nodegit.Repository.open(repoName)
        .then(function(repo) {
            console.log('commit repo', repo);
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
            console.log("oid");
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
            // the file is removed from the git repo, use fs.unlink now to remove it
            // from the filesystem.
            console.log("New Commit:", commitId.allocfmt());
        })
        /// PUSH
        .then(function() {
            pushBranch(repoName, user, repoURL)
        });

}

// Push branch to github
//FIGURE OUT WAY TO PASS IN accessToken FOR PRIVATE REPOS*****
function pushBranch(repoName, user, repoURL){
    /*require('simple-git')()*/
        simpleGit('./' + repoName).push(['origin', 'TidyGit:TidyGit'], function () {
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