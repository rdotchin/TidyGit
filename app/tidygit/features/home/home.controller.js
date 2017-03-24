angular
	.module('tidygit.home')
	.controller('HomeCtrl', HomeCtrl);


function HomeCtrl(user, $http, $timeout){
	const vm = this;
    vm.repoArr = [];
    vm.user = [];

    /*================PUSHER===================================*/
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var pusher = new Pusher('cdd662307ca417771c70', {
        encrypted: true
    });


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

	 /* After receiving the users github repos (the user will eventually select but for now)
	   We will send the first repo responses URL and Name.  The app on the server side will
	   download the repo, parse the directory for .js files, beautify the files (and eventually
	   send a pull request for the user*/
        vm.cleanRepo = function (repo) {
            repo.status = 'pending';

            var repoName = repo.name;
            var channelName = repo.owner.login + '-' + repoName;

            console.log(channelName);
            $http.post('/clean/repo', {
                    repoName: repoName
                })
                .then(function (resp) {

                    buttonResp(repo, resp);
                })
                .catch(function(error) {
                    //if error button will turn red
                    repo.status = 'fail';

                    $timeout(function() {
                        repo.status = null;
                    }, 8000);
                });
        };

     /*use the response back from pusher to change the submit button to either
      green(success) or red(fail)*/
    function buttonResp(repo, resp){
        var channelName = repo.owner.login + '-' + repo.name;
        //create pusher channel
        var channel = pusher.subscribe(channelName);
        //pusher channel if success
        channel.bind('tidy-success', function(data) {
            console.log('tidy-success', data);
            //button will turn green
            $timeout(function() {
                repo.status = 'success';
                console.log(repo.status);
            });
            //go back to blue in 8 seconds
            $timeout(function() {
                repo.status = null;
            }, 8000);
            //unsubscribe from pusher channel
            pusher.unsubscribe(channelName);
        });
        //pusher channel if fail
        channel.bind('tidy-fail', function(data){
            console.log('tidy-fail', data);
            //button will turn red
            $timeout(function() {
                repo.status = 'fail';
            });
            //go back to blue in 8 seconds
            $timeout(function() {
                repo.status = null;
            }, 8000);
            //unsubscribe from pusher channel
            pusher.unsubscribe(channelName);
        });
    }
}