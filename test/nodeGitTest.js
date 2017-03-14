const Git = require("nodegit");
const execFile = require('child_process').execFile;
const fs = require('fs');
/* Test nodegit by cloning a GitHub repo*/
/*Git.Clone("https://github.com/rdotchin/angular-to-do", "angtodo").then(function(repository) {
  // Work with the repository object here.
  console.log("success");
});*/

//find all files in angtodo 
execFile('find', [ 'angtodo' ], function(err, stdout, stderr) {
  //split the results with a space
  var file_list = stdout.split('\n');
  var arr = [];
  arr.push(file_list);

  //for each file search if it includes .js but doesn't include bower(to reduce results)
  file_list.forEach(function(element){
  	if (element.includes(".js") && !element.includes("bower")) {
  		console.log(element);
  	}
  });


});

