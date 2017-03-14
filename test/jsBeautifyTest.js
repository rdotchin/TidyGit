var beautify = require('js-beautify').js_beautify,
    fs = require('fs');

//look for file with jsbeautify and html tidy settings


/*function readFiles to fs.readdir
    can store in an object (possibly an array)
    then call function editFiles*/

//function editFiles
/*filesArray.forEach(function(element){
	if(javascript file){jsBeautify then fs.writefile with same name}
	else if(html){HTML tidy then fs.writefile with same name}
	else{}
})*/


/*function pullRequest(){
	function to submit a pull request with custom message

}*/

/*read the test.js file*/
fs.readFile('test.js', 'utf8', function (err, data) {
    if (err) {
        throw err;
    }
    /* Beautify the foo.js file and replace it*/
    fs.writeFile('test.js', beautify(data, { indent_size: 6 }, (err) => {
    	if (err) throw err;
    	console.log('file saved');
    }));
});