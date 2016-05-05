app.factory('OrdersFactory', function($http, $rootScope){

	var cart;

	$http.get('/api/orders/myCart')
				.then(function(res) {
					cart = res.data;
					$rootScope.$emit('cartUpdate', cart.itemCount);
					console.log("retrieved cart: ", cart);
				});

	return {

		reloadCart: function() {
			$http.get('/api/orders/myCart')
				.then(function(res) {
					cart = res.data;
					$rootScope.$emit('cartUpdate', cart.itemCount);
					console.log("retrieved cart: ", cart);
				});
		},

		getOrderHistory : function(userId){
			return $http.get('/api/orders/myOrders/'+userId)
				.then(function(res){
					return res.data;
				});
		},

		searchOrders : function(orders){
			console.log(orders);
		},

		getCart : function() {
			return cart;
		},

		populateCart : function() {
			return $http.get('/api/orders/'+cart._id)
			.then(function(res) {
				cart = res.data;
				$rootScope.$emit('cartUpdate', cart.itemCount);
				console.log("populated cart:", res.data);
				return res.data;
			});
		},
		
		getLineIndex: function(product) {
			var ret = -1;
			cart.lineItems.forEach(function(li, index) {
				if(li.prod_id == product._id || li.prod_id._id == product._id) {
					ret = index;
				}
			});
			
			if(ret > -1)
				return ret;

			cart.lineItems.push({
				prod_id: product._id,
				quantity: 0,
				price: product.price
			});

			return cart.lineItems.length-1;
		},

		addToCart : function(product){
			//	This code is likely only temporary, 
			//	but it will handle all necessary 
			//  grouping for carts...

			var lineIndex = this.getLineIndex(product);
			cart.lineItems[lineIndex].quantity++;
			
			return $http.put('/api/orders/myCart', cart)
				.then(function(res) {
					cart = res.data;
					$rootScope.$emit('cartUpdate', cart.itemCount);
					return cart;
				})
				.catch(function(err) {
					console.log("error ",err);
				});
		},

		addItem : function(product, qty) {
			var lineIndex = this.getLineIndex(product);
			cart.lineItems[lineIndex].quantity += qty;
			
			return $http.put('/api/orders/myCart', cart)
				.then(function(res) {
					cart = res.data;
					$rootScope.$emit('cartUpdate', cart.itemCount);
					return res.data;
				});
			
		},

		removeFromCart : function(product) {
			var lineIndex = this.getLineIndex(product);
			cart.lineItems.splice(lineIndex,1);

			return $http.put('/api/orders/myCart', cart)
				.then(function(res) {
					cart = res.data;
					$rootScope.$emit('cartUpdate', cart.itemCount);
					return res.data;
				});
		}

	};
	
});


