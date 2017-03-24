angular
    .module('tidygit', [
        'ui.router',
        'tidygit.login',
        'tidygit.home'
    ])
    .config(tidygitConfig);

function tidygitConfig($urlRouterProvider) {
    // If the URL does not exist as a route, redirect to /
    $urlRouterProvider.otherwise('/');

}