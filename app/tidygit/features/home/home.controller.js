angular
    .module('tidygit.home')
    .controller('HomeCtrl', HomeCtrl);


function HomeCtrl(user, $http, $timeout) {
    const vm = this;
    vm.repoArr = []; //Array to hold the users repos
    vm.user = []; //Array to hold the user data


    /*================PUSHER===================================*/
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    var pusher = new Pusher('cdd662307ca417771c70', {
        encrypted: true
    });

    /* Get request to retrieve the users information.  Need the username to pull
    their github repos*/
    $http.get('/user')
        .then(function(resp) {
            vm.user = resp.data;
            console.log(vm.user);
        });


    $http.get('/repos')
        .then(function(resp) {
            //Parse response data and push the data for each Github repo to the repoArr
            resp.data.forEach(function(data, indx) {
                console.log(data);
                vm.repoArr.push(data);
            });
            console.log(vm.repoArr);

        });

    /* Make a post to the server sending the repo name to run through TidyGit process.  During this
       process the button will spin then either turn green(success) or red(fail*/
    vm.cleanRepo = function(repo, index) {
        resetPusher(); //reset variables set to pusher responses
        vm.buttonsDisabled = true;
        vm.index = index;
        repo.status = 'pending'; //Change button to spinning
        var repoName = repo.name;
        var channelName = repo.owner.login + '-' + repoName;
        //Post to send repo name to begin tidy process
        $http.post('/clean/repo', {
                repoName: repoName,
                URL: repo.html_url
            })
            .then(function(resp) {
                //function to change button to green or red
                buttonResp(repo, resp);
            })
            .catch(function(err) {
                if(err){console.log(err);}
                //if error button will turn red
                repo.status = 'fail';

                $timeout(function() {
                    repo.status = null;
                }, 8000);
            });
    };

    /*use the response back from pusher to change the submit button to either
     green(success) or red(fail)*/
    function buttonResp(repo, resp) {
        var channelName = repo.owner.login + '-' + repo.name; //set pusher channel name
        var channel = pusher.subscribe(channelName); //create pusher channel
        tidyStatus(channel); //function containing pusher communication
        //pusher channel if success
        channel.bind('tidySuccess', function(data) {
            $timeout(function() {
                vm.gitComplete = data.message; //success message
                vm.statusBar = 100; //status bar at 100%
                vm.barColor = 'is-success'; //status bar turns green
                repo.status = 'success';//button will turn green
                vm.buttonsDisabled = false; //enable buttons
            });
            //go back to blue in 8 seconds
            $timeout(function() {
                repo.status = null;
                vm.index = null;
            }, 8000);
            pusher.unsubscribe(channelName); //unsubscribe from pusher channel
        });
        //pusher channel if fail
        channel.bind('tidyFail', function(data) {
            $timeout(function() {
                vm.gitComplete = data.message; //error message
                vm.statusBar = 100; //status bar at 100%
                vm.barColor = 'is-danger';//status bar turns red
                repo.status = 'fail'; //button turns red
                vm.buttonsDisabled = false; //enable buttons
            });
            //go back to blue in 8 seconds
            $timeout(function() {
                repo.status = null; //reset status for button ng-class
                vm.index = null; //reset index for button ng-click
            }, 8000);
            pusher.unsubscribe(channelName); //unsubscribe from pusher channel
        });
    }

    function tidyStatus(channel) {
        vm.statusBar = 10;
        vm.barColor = 'is-info';
        channel.bind('clone', function(data) {

            $timeout(function() {
                vm.clone = data.message;
                vm.statusBar = 30;
            });
            console.log(data);
        });
        channel.bind('branch', function(data) {
            $timeout(function() {
                vm.branch = data.message;
                vm.statusBar = 40;
            });
            console.log(data);
        });
        channel.bind('readFiles', function(data) {
            $timeout(function() {
                vm.readFiles = data.message;
                vm.statusBar = 50;
            });
            console.log(data);
        });
        channel.bind('writeFiles', function(data) {
            $timeout(function() {
                vm.writeFiles = data.message;
                vm.statusBar = 60;
            });
            console.log(data);
        });
        channel.bind('gitAdd', function(data) {
            $timeout(function() {
                vm.gitAdd = data.message;
                vm.statusBar = 70;
            });
        });
        channel.bind('gitCommit', function(data) {
            $timeout(function() {
                vm.gitCommit = data.message;
                vm.statusBar = 80;
            });
        });
        channel.bind('gitPush', function(data) {
            $timeout(function() {
                vm.gitPush = data.message;
                vm.statusBar = 90;
            });
        });
    }

    function resetPusher() {
        vm.clone = '';
        vm.branch = '';
        vm.readFiles = '';
        vm.writeFiles = '';
        vm.gitAdd = '';
        vm.gitCommit = '';
        vm.gitPush = '';
        vm.gitComplete = '';
    };
}