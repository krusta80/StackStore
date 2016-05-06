app.directive('addressBook', function ($state, AddressesFactory) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/address-book/address-book.html',
        scope:{
        	values: "=",
        	user: "=",
        },
        link: function (scope) {
        	AddressesFactory.findByUserId(scope.user)
        	.then(function(addresses){
        		scope.addresses = addresses;
        	});

        	//Why is this necessary - why isn't ng-model updating on it's own?
        	scope.updateValues = function(address){
        		for(var key in address){
        			scope.values[key] = address[key];
        		}
        	}
        }
    };

});