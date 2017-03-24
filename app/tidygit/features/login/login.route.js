angular
    .module('tidygit.login')
    .config(loginConfig);

function loginConfig($stateProvider) {
    $stateProvider.state({
        name: 'login',
        url: '/',
        templateUrl: '/tidygit/features/login/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'LoginVM'
    });
}