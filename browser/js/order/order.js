app.config(function($stateProvider){
	$stateProvider
		.state('orderDetails', {
			url: '/orders/:id', //We need to limit access to this on backend (self or admin).
			controller: 'OrderCtrl', 
			templateUrl: 'js/order/orderDetails.html',
			resolve: {
				user: function(AuthService){
          return AuthService.getLoggedInUser();
				},
				order: function(OrdersFactory, $stateParams){
					return OrdersFactory.getOrder($stateParams.id);
				},
				billingAddress: function(AddressesFactory, order){
          //how is order gettting injected here
					return order.billingAddress;
				},
				shippingAddress: function(AddressesFactory, order){
          //how is order getting inject here?
					return order.shippingAddress;
				}
			}
		});
});

app.controller('OrderCtrl', function($scope, $state, user, order, billingAddress, shippingAddress, OrdersFactory){

	$scope.user = user;
	console.log("order", order)
	$scope.order = order;
	$scope.billingAddress = billingAddress;
	$scope.shippingAddress = shippingAddress;

	//DUPLICATED CODE - DRY this out
  //yes.. move it into a factory
	$scope.calculateTax = function(){
		var state = $scope.billingAddress.state;
		var subtotal = $scope.order.subtotal;
		if(state){
			return parseFloat((subtotal * (OrdersFactory.getSalesTaxPercent(state) / 100)).toFixed(2));
		}
	}

	$scope.cancelOrder = function(){
		if($scope.order.status === 'Ordered'){
      //is this a promise?
			OrdersFactory.cancelOrder($scope.order);
		}
	}

});
