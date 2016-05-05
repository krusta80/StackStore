app.config(function($stateProvider){
	$stateProvider
		.state('orderHistory', {
			url: '/myAccount/:userId/orderHistory',
			controller: 'OrdersController',
			templateUrl: 'js/orders/orderHistory.html',
			resolve: {
				user: function(AuthService){
					AuthService.getLoggedInUser().then(function(user){
						return user;
					})
					.catch(function(err){
						console.log("ERR:", err)
					})
				},
				orders: function(OrdersFactory, $stateParams, user){
					console.log("MEE")
					// OrdersFactory.getOrderHistory($stateParams.userId)
					OrdersFactory.getOrderHistory(user._id)
						.then(function(orders){
							console.log("FOUND!")
							return orders;
						})
						.catch(function(err){
							console.log("ERR:", err);
						})
				} 
			}
		})
})

app.controller('OrdersController', function($scope, AuthService, OrdersFactory, $stateParams, user, orders){
	$scope.user = user;
	$scope.orders = orders;
	console.log("orders are:",$scope.orders)
	$scope.searchOrders = OrdersFactory.searchOrders; //No functionality here yet
})
//myAccount/572a89bbb5a7a4cab78d5a3c/orderHistory