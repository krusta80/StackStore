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
			updatedCart.lineItems.forEach(function(lineItem, index) {
				$scope.cart.lineItems[index].quantity = updatedCart.lineItems[index].quantity;
			});
			$scope.cart.subtotal = updatedCart.subtotal;
		})
	};

	$scope.deleteItem = function(product) {
		OrdersFactory.removeFromCart(product)
		.then(function(updatedCart) {
			$scope.cart.lineItems = $scope.cart.lineItems.filter(function(lineItem) {
				return lineItem.prod_id._id !== product._id;
			});
			$scope.cart.subtotal = updatedCart.subtotal;
		})
	};

});