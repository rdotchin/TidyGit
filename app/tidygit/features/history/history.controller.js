angular
    .module('tidygit.history')
    .controller('HistoryCtrl', HistoryCtrl);

function HistoryCtrl($http){
    const vm = this;
    vm.user = []; //Array to hold the user data

    $http.get('/user')
        .then(function(resp) {
            vm.user = resp.data;
            console.log(vm.user);
        });


}