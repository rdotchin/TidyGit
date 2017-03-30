angular
    .module('toDoList.component.navbar')
    .directive('navbar', Navbar);

function Navbar() {
    return {
        restrict: 'E', //Directive will be an element <tabs></tabs>
        scope: {
            navbarData: '=',
            searchData: '='
        },
        templateUrl: '/tidygit/features/components/navbar/navbar.html',
        controller: NavbarCtrl, // The function to use as the controller for the directive
        controllerAs: 'NavbarVM', //The namespace for the view to access the view model
        bindToController: true // The scope is isolated because we are using controllerAs
    };
}

function NavbarCtrl() {
    var vm = this;
}