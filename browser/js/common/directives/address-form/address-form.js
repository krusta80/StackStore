app.directive('addressForm', function ($state) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/address-form/address-form.html',
        scope:{
        	values: "="
        }
    };

});