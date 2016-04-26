app.factory('OrdersFactory', function($http){

	var cart;

	return {
		
		addToCart : function(productId){
			//	This code is likely only temporary, 
			//	but it will handle all necessary 
			//  grouping for carts...

			if(!cart)
				$http.get('/api/orders/myCart')
				.then(function(res) {
					cart = res.data;
					console.log("retrieved cart: ", cart);
				});

			
		}

	};
	
});