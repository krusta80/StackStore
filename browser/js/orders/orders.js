app.config(function($stateProvider){
	$stateProvider
		.state('orderHistory', {
			url: '/myAccount/orderHistory',
			controller: 'OrdersController',
			templateUrl: 'js/orders/orderHistory.html',
			resolve: {
				user: function(AuthService){
					return AuthService.getLoggedInUser().then(function(user){
						return user;
					})
					.catch(function(err){
						console.log("Get User ERR:", err)
					})
				},
				orders: function(OrdersFactory, $stateParams, user){
					return OrdersFactory.getOrderHistory(user._id)
						.then(function(orders){
							return orders;
						})
						.catch(function(err){
							console.log("Get History ERR:", err);
						})
				} 
			}
		});
});

app.controller('OrdersController', function($scope, AuthService, OrdersFactory, $stateParams, user, orders){
	$scope.user = user;
	$scope.orders = orders;
});