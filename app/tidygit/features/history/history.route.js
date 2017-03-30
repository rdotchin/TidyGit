angular
    .module('tidygit.history')
    .config(HistoryConfig);

function HistoryConfig($stateProvider) {
    $stateProvider.state({
        name: 'history',
        url: '/history',
        templateUrl: '/tidygit/features/history/history.html',
        controller: 'HistoryCtrl',
        controllerAs: 'HistoryVM'
    });
}