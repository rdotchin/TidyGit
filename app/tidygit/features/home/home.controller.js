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
        });


    $http.get('/repos')
        .then(function(resp) {
            //Parse response data and push the data for each Github repo to the repoArr
            resp.data.forEach(function(data, indx) {
                vm.repoArr.push(data);
            });
        });

    /* Make a post to the server sending the repo name to run through TidyGit process.  During this
       process the button will spin then either turn green(success) or red(fail*/
    vm.cleanRepo = function(repo) {
        console.log('repo', repo);
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
    function buttonResp(repo, resp) {
        var channelName = repo.owner.login + '-' + repo.name;
        //create pusher channel
        var channel = pusher.subscribe(channelName);
        //pusher channel if success
        channel.bind('tidy-success', function(data) {
            //button will turn green
            $timeout(function() {
                repo.status = 'success';
            });
            //go back to blue in 8 seconds
            $timeout(function() {
                repo.status = null;
            }, 8000);
            //unsubscribe from pusher channel
            pusher.unsubscribe(channelName);
        });
        //pusher channel if fail
        channel.bind('tidy-fail', function(data) {
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