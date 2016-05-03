app.config(function($stateProvider){

	$stateProvider.state('cart', {
		url: '/cart',
		controller: 'CartCtrl',
		templateUrl: 'js/cart/cart.html',
		resolve: {
			cart: function(OrdersFactory) {
				return OrdersFactory.populateCart();
			}
		}
	});
});

app.controller('CartCtrl', function(cart, OrdersFactory, $scope, $stateParams){

	$scope.cart = cart;

	$scope.addToCart = function(product, qty) {
		OrdersFactory.addItem(product, qty)
		.then(function(updatedCart) {
			return OrdersFactory.populateCart(updatedCart.id);
		})
		.then(function(populatedCart) {
			$scope.cart = populatedCart;
		})
	};

	$scope.deleteItem = function(product) {
		OrdersFactory.removeFromCart(product)
		.then(function(updatedCart) {
			return OrdersFactory.populateCart(updatedCart.id);
		})
		.then(function(populatedCart) {
			$scope.cart = populatedCart;
		})
	};

});