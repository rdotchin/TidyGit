const nodegit = require("nodegit"); // Used to clone github repos
const execFile = require('child_process').execFile;
const request = require('request');
const fs = require('fs');
const beautify = require('js-beautify').js_beautify;
const moment = require('moment');
const path = require('path');

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
            /*console.log('\nRESPONSE', response);
             console.log('\nBODY', body);*/
        })
    },



    cloneRepo : function(repoURL, repoName, user) {
        var signature = nodegit.Signature.create(user.name, user.email, moment().unix(), 0);

        /* CLONE THE GITHUB REPO */
        nodegit.Clone(repoURL, repoName).then(function (repository) {
            //OPEN THE REPO AND CREATE A NEW BRANCH CALLED TidyGit
            nodegit.Repository.open('./testfile')
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
                checkoutBranch('testfile');
                console.log("All done!");

            });


        });
    },


    // function to delete repo dir
    deleteRepo: function(file){

    }


};

/* CHECKOUT THE TIDYGIT BRANCH*/
function checkoutBranch(repoName){

    nodegit.Repository.open('./testfile').then(function(repo) {
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
        /*parseDir(repoName);*/
        console.log('Finished');
    });
}

//find all files in github repo
function parseDir(repoName) {
    execFile('find', [repoName], function (err, stdout, stderr) {
        //split the results with a space
        /*console.log(repoName + " parsed");*/
        var fileList = stdout.split('\n');

        //for each file search if it includes .js and doesn't include bower(to reduce results)
        fileList.forEach(function (file) {
            if (file.includes(".js") && !file.includes("bower")) {
                //call function to beautify the js file
                beautifyFile(file);
            }

        });
        githubCommit();
    });
}

/*Read js file, beautify the file, replace the file*/
function beautifyFile(file) {
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
    //call function to create a github pull request
}

// Create a repo commit
function githubCommit(){

    var _repository;
    var _index;
    var _oid;

    //open a git repo
    nodegit.Repository.open("testfile")
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
           /* githubPR();*/
        })
        .done();

}

// function for github pull request
function githubPR() {

    var options = {
        /*'https://api.github.com/repos/rdotchin/' + repoName + '/pulls'*/
        'url': 'https://api.github.com/repos/rdotchin/testfile/pulls',

        'headers': {
            'Authorization': user.accessToken,
            'User-Agent': 'rdotchin',
            'title': 'TidyGit',
            'body': 'Pull this in!',
            'head': 'master',
            'base': 'master'

        }
    };
    console.log(user.accessToken);
    request.post(options, function(err, httpResponse, body){
        console.log("githubPR, http code", httpResponse);

        /*console.log(httpResponse);*/
        console.log(body);
    })
}