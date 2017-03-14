const Git = require("nodegit");
const execFile = require('child_process').execFile;
const fs = require('fs');
const beautify = require('js-beautify').js_beautify;


/* Use nodegit to clone the github repo */
Git.Clone("https://github.com/rdotchin/testfile", "testfile").then(function(repository) {
  // Work with the repository object here.
  console.log("success");
});

//find all files in github repo
execFile('find', [ 'testfile' ], function(err, stdout, stderr) {
  //split the results with a space
  var fileList = stdout.split('\n');

  //for each file search if it includes .js and doesn't include bower(to reduce results)
  fileList.forEach(function(file){
  	if (file.includes(".js") && !file.includes("bower")) {
  		//call function to beautify the js file
  		beautifyFile(file);
  	}
  });
});


/*Read js file, beautify the file, replace the file*/
function beautifyFile(file){
	//read js file
	fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
        throw err;
    }
    /* Beautify the foo.js file and replace it*/
    fs.writeFile(file, beautify(data, { indent_size: 6 }, (err) => {
    	if (err) throw err;
    	console.log('file saved');
    }));
});

}

