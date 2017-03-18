angular
    .module('tidygit.component.user')
    .service('user', UserService);


function UserService($http){
    /*
    /!* Get request to retrieve the users information.  Need the username to pull
     their github repos*!/
    $http.get('/user')
        .then(function(resp){
            console.log(resp.data);
            var username = resp.data[0].username;
            Lockr.set('username', username);
            Lockr.set('accessToken', resp.data[0].accessToken);
            Lockr.set('githubId', resp.data[0].githubId);
            Lockr.set('photo', resp.data[0].photo);
            Lockr.set('profileUrl', resp.data[0].profileUrl);
            getRepo(username);
        });

    /!*After getting the user data this function will be invoked to retrieve all of
     the users GitHub repos*!/
    function getRepo(username) {
        $http.get('https://api.github.com/users/' + username + '/repos')
            .then(function(resp){
                // Arrays to hold repo url and repo name
                var repoUrlArr = [];
                var repoNameArr = [];
               /!* var repoUrl = resp.data[25].html_url;
                var repoName = resp.data[25].name;*!/


                resp.data.forEach(function(data){
                    repoUrlArr.push(data.html_url); //push repo url to array
                    repoNameArr.push(data.name); // push repo name to array
                });
                console.log("ARRAYS");
                //return both arrays
                return {
                    repoUrlArr: repoUrlArr,
                    repoNameArr: repoNameArr
                }


            })
    }*/





}
