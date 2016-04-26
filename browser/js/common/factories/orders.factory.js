app.factory('OrdersFactory', function($http, $rootScope){

	var cart;

	$http.get('/api/orders/myCart')
				.then(function(res) {
					cart = res.data;
					$rootScope.$emit('cartUpdate', cart.itemCount);
					console.log("retrieved cart: ", cart);
				});

	return {
		
		getLineIndex: function(product) {
			var ret = -1;
			cart.lineItems.forEach(function(li, index) {
				if(li.prod_id === product._id) {
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
			
			$http.put('/api/orders/myCart', cart)
				.then(function(res) {
					cart = res.data;
					$rootScope.$emit('cartUpdate', cart.itemCount);
					//console.log("Items: ", cart.itemCount);
					//console.log("Subtotal: ", cart.subtotal);
				})
				.catch(function(err) {
					console.log("error ",err);
				});
		}

	};
	
});


