angular
    .module('tidygit.component.user')
    .service('user', UserService);


function UserService($http) {
    return {
        getUser: function(user) {
            $http.get('/user')
                .then(function(resp) {
                    user = resp.data;
                });
        }
    }

}