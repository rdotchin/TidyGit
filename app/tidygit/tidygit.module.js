angular
    .module('tidygit', [
        'ui.router',
        'tidygit.login',
        'tidygit.home',
        'tidygit.history',
        'tidygit.component.navbar',
        'tidygit.component.foot',
        'tidygit.component.user'
    ])
    .config(tidygitConfig);

function tidygitConfig($urlRouterProvider) {
    // If the URL does not exist as a route, redirect to /
    $urlRouterProvider.otherwise('/');

}