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

	//Still have to test in HTML
	$scope.setQuantity = function(product, qty){
		OrdersFactory.setItemQuantity(product, qty)
		.then(function(updatedCart){
			return OrdersFactory.populateCart(updatedCart.id)
		})
		.then(function(populatedCart){
			$scope.cart = populatedCart;
		})
	}

	$scope.deleteItem = function(product) {
		OrdersFactory.removeFromCart(product)
		.then(function(updatedCart) {
			return OrdersFactory.populateCart(updatedCart.id);
		})
		.then(function(populatedCart) {
			$scope.cart = populatedCart;
		})
	};

	// Truncate to two decimal places
	$scope.calculateTax = function(){
		var state = $scope.billing.state;
		var subtotal = $scope.cart.subtotal;
		if(state){
			return parseFloat((subtotal * (OrdersFactory.getSalesTaxPercent(state) / 100)).toFixed(2));
		}
	}

	$scope.testValues = function(){
		console.log("billing", $scope.billing);
		console.log("shipping", $scope.shipping)
	}

});