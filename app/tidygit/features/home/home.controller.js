angular
	.module('tidygit.home')
	.controller('HomeCtrl', HomeCtrl);

function HomeCtrl($http){
	const vm = this;
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
		

	
		
			$http({
			method: 'GET',
			url: '/login/github'
		}).then(function(response){
			console.log(response.data[0].username);
			lockr.set('accessToken', response.data[0].accessToken);
			lockr.set('username', response.data[0].username);
		});
	
	
}