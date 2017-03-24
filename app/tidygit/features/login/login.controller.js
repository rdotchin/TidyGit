angular
    .module('tidygit.login')
    .controller('LoginCtrl', LoginCtrl);

function LoginCtrl($http) {
    /*$httpProvider.interceptors.push(function($q, $location) { 
    return { 
    	response: function(response) { 
    	// do something on success return response; 
    	}, 
    	responseError: function(response) { 
    		if (response.status === 401) 
    			$location.url('/auth/github'); 
    		return $q.reject(response); 
    		} 
    	}; 
    });*/


    function gitLogin() {
        $http({
            method: 'GET',
            url: '/auth/github'
        }).then(function(response) {
            console.log(response);
        });
    }
}