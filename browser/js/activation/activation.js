app.config(function ($stateProvider) {
    $stateProvider.state('activation', {
        url: '/activation/:key',
        templateUrl: 'js/activation/activation.html',
        controller: 'ActivationCtrl',
        resolve: {
        	user: function($stateParams, UsersFactory) {
        		return UsersFactory.activate($stateParams.key);
        	}
        }
    });
    $stateProvider.state('pastOrder', {
        url: '/pastOrder/:key',
        templateUrl: 'js/order/orderDetails.html',
        controller: 'OrderCtrl',
        resolve: {
            user: function(){
                return {};    
            },
            order: function(OrdersFactory, $stateParams){
                return OrdersFactory.getPastOrder($stateParams.key);
            },
            billingAddress: function(AddressesFactory, order){
              //where is order coming from?
              //I don't see an order factory or order service
                return order.billingAddress;
            },
            shippingAddress: function(AddressesFactory, order){
                return order.shippingAddress;
            }
        }
    });
});

app.controller('ActivationCtrl', function($state, $scope, user) {
	
	$scope.user = user;
	
	if(user.active)
		setTimeout(function() {
			$state.go('login');
		}, 2000);

});
