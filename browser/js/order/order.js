app.config(function($stateProvider){
	$stateProvider
		.state('orderDetails', {
			url: '/orders/:id', //We need to limit access to this on backend (self or admin).
			controller: 'OrderCtrl', 
			templateUrl: 'js/order/orderDetails.html',
			resolve: {
				user: function(AuthService){
					return AuthService.getLoggedInUser().then(function(user){
						return user;
					})
					.catch(function(err){
						console.log("Get User ERR:", err)
					})
				},
				order: function(OrdersFactory, $stateParams){
					return OrdersFactory.getOrder($stateParams.id);
				},
				billingAddress: function(AddressesFactory, order){
					return order.billingAddress;
				},
				shippingAddress: function(AddressesFactory, order){
					return order.shippingAddress;
				}
			}
		});
});

app.controller('OrderCtrl', function($scope, $state, user, order, billingAddress, shippingAddress, OrdersFactory){

	$scope.user = user;
	$scope.order = order;
	$scope.billingAddress = billingAddress;
	$scope.shippingAddress = shippingAddress;

	//DUPLICATED CODE - DRY this out
	$scope.calculateTax = function(){
		var state = $scope.billingAddress.state;
		var subtotal = $scope.order.subtotal;
		if(state){
			return parseFloat((subtotal * (OrdersFactory.getSalesTaxPercent(state) / 100)).toFixed(2));
		}
	}

	$scope.cancelOrder = function(){
		if($scope.order.status === 'Ordered'){
			OrdersFactory.cancelOrder($scope.order, user);
		}
	}

	//Calculate Tax
});