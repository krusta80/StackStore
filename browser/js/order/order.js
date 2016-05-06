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
					console.log("stateParams", $stateParams)
					return OrdersFactory.getOrder($stateParams.id);
				}
			}
		});
});

app.controller('OrderCtrl', function($scope, user, order){

	$scope.user = user;
	$scope.order = order;

	console.log("user", user, "order", order);

	//Calculate Tax
});