const Git = require("nodegit"); // Used to clone github repos
const execFile = require('child_process').execFile;
const request = require('request');
const fs = require('fs');
const beautify = require('js-beautify').js_beautify;

module.exports = function(repoURL, repoName) {
    /* Use nodegit to clone the github repo */
    Git.Clone(repoURL, repoName).then(function (repository) {
        // Work with the repository object here.
        parseDir(repoName);
    });

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
            githubPR(repoName);
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

    // function for github pull request
    function githubPR(repoName){
        /*console.log("githubPRRepoName", repoName);*/
        var options = {
            url: 'https://api.github.com/repos/rdotchin/' + repoName + '/pulls',
            headers: {
                'User-Agent': 'request',
                'title': 'TidyGit',
                'body': 'Pull this in!',
                'head': 'master',
                'base': 'master'

            }
        };
        request.post(options, function(err, httpResponse, body){
            /*console.log("githubPR");
            console.log(httpResponse);
            console.log(body);*/
        })
    }

    // function to delete repo dir
    function deleteRepo(file){

    }
};
