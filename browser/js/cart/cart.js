//think about separating out this file...
//-- cart.state.js
//-- cart.ctrl.js
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

app.controller('CartCtrl', function(cart, OrdersFactory, $scope, $stateParams, $state, $rootScope, AuthService){

	$scope.cart = cart;
	console.log("Cart state when entering checkout page:", cart);
	$scope.billing = {}; $scope.shipping = {};

  //look closer at this method...
  //there is no way catch will be hit because there is a catch in getLoggedInUser
  //this is very important because you are setting user to null in that case
	AuthService.getLoggedInUser()
	.then(function(user) {
		$scope.user = user;
	})
	.catch(function(err) {
		console.log("No user found for this seesion!");
	});

	$scope.addressBookShown = false;
	$scope.toggleAddressBook = function(context) {
	    $scope.addressBookShown = !$scope.addressBookShown;
	    if(context !== $scope.addressBookContext){
	    	$scope.addressBookShown = true;
	    }
	    
	    if($scope.addressBookShown){
	    	$scope.addressBookContext = context;
			console.log("context", $scope.addressBookContext);
	    } 
	 };

	$scope.isEmpty = function(){
		return $scope.cart.lineItems.length === 0;
	}

	$scope.addToCart = function(product, qty) {
		OrdersFactory.addItem(product, qty)
		.then(function(updatedCart) {
			return OrdersFactory.populateCart(updatedCart.id);
		})
		.then(function(populatedCart) {
			$scope.cart = populatedCart;
		});
	};

	$scope.setQuantity = function(product, qty){
		OrdersFactory.setItemQuantity(product, qty)
		.then(function(updatedCart){
			return OrdersFactory.populateCart(updatedCart.id);
		})
		.then(function(populatedCart){
			$scope.cart = populatedCart;
		});
	};

	$scope.deleteItem = function(product) {
		OrdersFactory.removeFromCart(product)
		.then(function(updatedCart) {
			return OrdersFactory.populateCart(updatedCart.id);
		})
		.then(function(populatedCart) {
			$scope.cart = populatedCart;
		});
	};

	// Truncate to two decimal places
	$scope.calculateTax = function(){
    //this seems like it should be a service/factory method
		var state = $scope.billing.state;
		var subtotal = $scope.cart.subtotal;
		if(state){
			return parseFloat((subtotal * (OrdersFactory.getSalesTaxPercent(state) / 100)).toFixed(2));
		}
	};

	$scope.submitOrder = function(){
		$scope.billing.userId = cart.userId; 
		$scope.shipping.userId = cart.userId;
		OrdersFactory.submitOrder(cart.id, $scope.cart, $scope.billing, $scope.shipping)
		.then(function(updatedCart){
			//Reset cart counter
			OrdersFactory.reloadCart();
			$rootScope.$emit('cartUpdate', 0);//is there a better way than using $emit
			//Clear cart after ordering
			$state.go('home');
		})
		.catch(function(err) {
			console.log("Error!", err);
		})
		
	}

});
