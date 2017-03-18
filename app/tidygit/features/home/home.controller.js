angular
	.module('tidygit.home')
	.controller('HomeCtrl', HomeCtrl);


function HomeCtrl(user, $http){
	const vm = this;

	/* Get request to retrieve the users information.  Need the username to pull
	their github repos*/
    $http.get('/user')
        .then(function(resp){
			var username = resp.data[0].username;
			Lockr.set('username', username);
			console.log("lockr", Lockr.get('username'));
			getRepo(username);
        });

    /*After getting the user data this function will be invoked to retrieve all of
      the users GitHub repos*/
     function getRepo(username) {
     	$http.get('https://api.github.com/users/' + username + '/repos')
			.then(function(resp){
				var repoUrl = resp.data[25].html_url;
				var repoName = resp.data[25].name;
				cleanRepo(repoUrl, repoName);
				console.log(resp.data[25].name);


			})
	 }

	 /* After receiving the users github repos (the user will eventually select but for now)
	   We will send the first repo responses URL and Name.  The app on the server side will
	   download the repo, parse the directory for .js files, beautify the files (and eventually
	   send a pull request for the user*/
	  function cleanRepo(repoUrl, repoName) {
     	$http.post('/clean/repo', {
     		repoUrl: repoUrl,
			repoName: repoName})
			.then(function(resp){
     		//if clean
			console.log(resp);
		 })
	 }

}