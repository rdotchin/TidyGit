angular
    .module('tidygit.component.foot')
    .directive('foot', Foot);

function Foot() {
    return {
        restrict: 'E', //Directive will be an element <tabs></tabs>
        scope: {
            footerData: '='
        },
        templateUrl: '/tidygit/features/components/foot/foot.html',
        controller: FootCtrl, // The function to use as the controller for the directive
        controllerAs: 'FootVM', //The namespace for the view to access the view model
        bindToController: true // The scope is isolated because we are using controllerAs
    };


    function FootCtrl() {
        var vm = this;

    }

}