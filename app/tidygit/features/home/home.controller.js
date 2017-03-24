angular
	.module('tidygit.home')
	.controller('HomeCtrl', HomeCtrl);


function HomeCtrl(user, $http){
	const vm = this;
    vm.repoArr = [];
    vm.user = [];
    vm.buttonState = '';

    /*===================BUTTONS====================================*/
    vm.selectButton = function(index){
        alert("clicked");

    };

    /*================PUSHER===================================*/
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var pusher = new Pusher('cdd662307ca417771c70', {
        encrypted: true
    });

    var channel = pusher.subscribe('my-channel');
    channel.bind('tidy-success', function(data) {
    	//update button to success and append github icon
        vm.buttonState = 'is-success';
        console.log('tidy', data);
    });

    channel.bind('tidy-fail', function(data){
        // update button state to red
        // show why failure
    });

	//function to close the modal
    vm.closeModal = function(){
    	vm.modal = "cancel";
	};


	/* Get request to retrieve the users information.  Need the username to pull
	their github repos*/
    $http.get('/user')
        .then(function(resp){
            console.log(resp.data);
			var username = resp.data.username;
			vm.user = resp.data;
			console.log(vm.user);
			/*getRepo(resp.data.username);*/
        });

    $http.get('/repos')
		.then(function(resp){
			console.log(resp.data);
            resp.data.forEach(function(data, indx){
                vm.repoArr.push(data);
            });
            console.log(vm.repoArr);

        });

    /*After getting the user data this function will be invoked to retrieve all of
      the users GitHub repos and put the url and name of each repo into an array to
      be displayed on the page for the user to select*/


	 /* After receiving the users github repos (the user will eventually select but for now)
	   We will send the first repo responses URL and Name.  The app on the server side will
	   download the repo, parse the directory for .js files, beautify the files (and eventually
	   send a pull request for the user*/
	  vm.cleanRepo = function(repoUrl, repoName, index) {
          //Open the modal with spinning gif
          vm.activeBtn = index; // sets ng-class to true;
          vm.buttonState = 'is-loading';
	      $http.post('/clean/repo', {
     		repoUrl: repoUrl,
			repoName: repoName})
			.then(function(resp){
     		//if clean
			console.log(resp);
		 })
	 }

}