angular
    .module('tidygit.component.nav')
    .directive('nav', Nav);

function Nav() {
    return {
        restrict: 'E', //Directive will be an element <tabs></tabs>
        scope: {
            tabsData: '=',
        },
        templateUrl: '/tidygit/features/components/nav/nav.html',
        controller: NavCtrl, // The function to use as the controller for the directive
        controllerAs: 'NavVM', //The namespace for the view to access the view model
        bindToController: true // The scope is isolated because we are using controllerAs
    };
}

function NavCtrl() {


}