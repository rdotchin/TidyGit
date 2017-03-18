angular
	.module('tidygit.home')
	.controller('HomeCtrl', HomeCtrl);


function HomeCtrl(user, $http){
	const vm = this;
    vm.repoArr = [];

	/* Get request to retrieve the users information.  Need the username to pull
	their github repos*/
    $http.get('/user')
        .then(function(resp){
            console.log(resp.data);
			var username = resp.data[0].username;
			Lockr.set('username', username);
			console.log("lockr", Lockr.get('username'));
			getRepo(username);
        });

    /*After getting the user data this function will be invoked to retrieve all of
      the users GitHub repos and put the url and name of each repo into an array to
      be displayed on the page for the user to select*/
     function getRepo(username) {
     	$http.get('https://api.github.com/users/' + username + '/repos')
			.then(function(resp){
                resp.data.forEach(function(data, indx){
                    vm.repoArr.push(data);
                });
                console.log(vm.repoArr);

			})
	 }

	 /* After receiving the users github repos (the user will eventually select but for now)
	   We will send the first repo responses URL and Name.  The app on the server side will
	   download the repo, parse the directory for .js files, beautify the files (and eventually
	   send a pull request for the user*/
	  vm.cleanRepo = function(repoUrl, repoName) {
	      alert("cleaning");
     	$http.post('/clean/repo', {
     		repoUrl: repoUrl,
			repoName: repoName})
			.then(function(resp){
     		//if clean
			console.log(resp);
		 })
	 }

}