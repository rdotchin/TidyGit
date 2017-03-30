angular
    .module('tidygit.history')
    .controller('HistoryCtrl', HistoryCtrl);

function HistoryCtrl($http){
    const vm = this;
    vm.user = []; //Array to hold the user data
    vm.repoHistory = [];

    $http.get('/user')
        .then(function(resp) {
            vm.user = resp.data;
            console.log('user', resp);
        });

    $http.get('/history')
        .then(function(resp) {

            resp.data.forEach(function(data, indx) {
                vm.repoHistory.push(data);
            });
            console.log(vm.repoHistory);
    });

}