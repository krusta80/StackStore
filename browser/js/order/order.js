app.config(function($stateProvider){
	$stateProvider
		.state('orderDetails', {
			url: '/orders/:id', //We need to limit access to this on backend (self or admin).
			controller: 'OrderCtrl', 
			templateUrl: 'js/order/orderDetails.html',
			resolve: {
				user: function(AuthService){
					console.log("u");
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
					return AddressesFactory.findById(order.billingAddress);
				},
				shippingAddress: function(AddressesFactory, order){
					return AddressesFactory.findById(order.shippingAddress);
				}
			}
		});
});

app.controller('OrderCtrl', function($scope, user, order, billingAddress, shippingAddress){

	$scope.user = user;
	$scope.order = order;

	console.log("user", user, "order", order);
	console.log("billingAddress", billingAddress, 
		"shippingAddress", shippingAddress);

	//Calculate Tax
});