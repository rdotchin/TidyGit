const Git = require("nodegit"); // Used to clone github repos
const execFile = require('child_process').execFile;
const fs = require('fs');
const beautify = require('js-beautify').js_beautify;

module.exports = function(repoURL, repoName) {
    /* Use nodegit to clone the github repo */
    Git.Clone(repoURL, repoName).then(function (repository) {
        // Work with the repository object here.
        console.log(repoName + " cloned");
        parseDir(repoName);
    });

    //find all files in github repo
    function parseDir(repoName) {
        execFile('find', [repoName], function (err, stdout, stderr) {
            //split the results with a space
            console.log(repoName + " parsed");
            var fileList = stdout.split('\n');

            //for each file search if it includes .js and doesn't include bower(to reduce results)
            fileList.forEach(function (file) {
                if (file.includes(".js") && !file.includes("bower")) {
                    //call function to beautify the js file
                    beautifyFile(file);
                }
            });
        });
    }

    /*Read js file, beautify the file, replace the file*/
    function beautifyFile(file) {
        console.log("it should beautify");
        //read js file
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                throw err;
            }
            /* Beautify the foo.js file and replace it*/
            fs.writeFile(file, beautify(data, {indent_size: 6}, function(err) {
                    if (err) throw err;
            console.log('Beautify Ran!!!');
        }))
        });
        //call function to create a github pull request
    }

    // function for github pull request
    function githubPR(file){

    }

    // function to delete repo dir
    function deleteRepo(file){

    }
};
