angular
    .module('tidygit.home')
    .config(homeConfig);

function homeConfig($stateProvider) {
    $stateProvider.state({
        name: 'home',
        url: '/home',
        templateUrl: '/tidygit/features/home/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'HomeVM'
    });
}