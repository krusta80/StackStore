app.factory('OrdersFactory', function($http, $rootScope, AddressesFactory, $q){

	var cart;

	$http.get('/api/orders/myCart')
				.then(function(res) {
					cart = res.data;
					$rootScope.$emit('cartUpdate', cart.itemCount);
					console.log("retrieved cart: ", cart);
				});

	return {

		//Functions for cart and order detail page
		reloadCart: function() {
			return $http.get('/api/orders/myCart')
				.then(function(res) {
					console.log("retrieved res: ", res);
					cart = res.data;
					$rootScope.$emit('cartUpdate', cart.itemCount);
				})
				.catch(function(err) {
					console.log("Error reloading cart", err);
				})
		},

		fetchAll: function() {
			return $http.get('/api/orders')
			.then(function(res){
				return res.data;
			})
		},

		getOrder: function(id){
			return $http.get('/api/orders/' + id)
			.then(function(res){
				return res.data;
			})
		},

		getPastOrder: function(key){
			return $http.get('/api/orders/pastOrders/' + key)
			.then(function(res){
				return res.data;
			})
		},

		getOrderHistory : function(){
			return $http.get('/api/orders/myOrders')
				.then(function(res){
					return res.data;
				});
		},

		getCart : function() {
			return cart;
		},

		populateCart : function() {
            return $http.get('/api/orders/myCart')
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

		addToCart : function(product, qty){
			//	This code is likely only temporary, 
			//	but it will handle all necessary 
			//  grouping for carts...

			if(!qty)
				var qty = 1;

			var lineIndex = this.getLineIndex(product);
			console.log("Adding to cart", cart);
			cart.lineItems[lineIndex].quantity+=qty;
			
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

		setItemQuantity: function(product, qty){
			var lineIndex = this.getLineIndex(product);
			if(qty >= 0){
				cart.lineItems[lineIndex].quantity = qty;
				
				return $http.put('/api/orders/myCart', cart)
					.then(function(res) {
						cart = res.data;
						$rootScope.$emit('cartUpdate', cart.itemCount);
						return res.data;
					});
			}else{
				console.log("Cannot set quantity below 0.")
			}
	
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
		},

		getSalesTaxPercent: function(state){
		    var taxTable = {
		        AL: 4.00, AK: 0.00, AZ: 5.60, AR: 6.50, CA: 7.50, CO: 2.90, CT: 6.35, DE: 0.00, FL: 6.00,
		        GA: 4.00, HI: 4.00, ID: 6.00, IL: 6.35, IN: 7.00, IA: 6.00, KS: 6.50, LA: 4.00, ME: 5.50, 
		        MD: 6.00, MA: 6.25, MI: 6.00, MN: 6.875, MS: 7.00, MO: 4.4225, MT: 0.00, NE: 5.50, NV: 6.85,
		        NH: 0.00, NJ: 7.00, NM: 5.125, NY: 4.00, NC: 4.75, ND: 5.00, OH: 5.75, OK: 4.50, OR: 0.00,
		        PA: 6.00, RI: 7.00, SC: 6.00, SD: 4.00, TN: 7.00, TX: 6.35, UT: 5.95, VT: 6.00, VA: 5.30, 
		        WA: 6.50, WV: 6.00, WI: 5.00, WY: 4.0
		    }

		    return taxTable[state];
		 },

		submitOrder: function(id, obj, billing, shipping){
			var addresses = {};
			console.log("OrderFactory -> billing", billing);
			return AddressesFactory.findOrCreate(billing)
			.then(function(billingAddress){
				addresses.billing = billingAddress._id;
				return AddressesFactory.findOrCreate(shipping)
			})
			.then(function(shippingAddress){
				addresses.shipping = shippingAddress._id;
				obj.shippingAddress = addresses.shipping;
				obj.billingAddress = addresses.billing;
				return $http.put('/api/orders/myCart/submit', obj);
			})
			.then(function(res){
				return res.data;
			})
			.catch(function(err) {
				console.log("Error submitting order:", err);
			 	if(err.data)
			 		return $q.reject(err.data);
			 	else
			 		return $q.reject(err);
			})
		},

		cancelOrder: function(obj){
			if(obj.status === 'Ordered'){
				obj.status = 'Canceled';
				return $http.put('/api/orders/' + obj.id, obj)
				.then(function(res){
					return res.data;
				})
			}

			return;
		},

		//Functions for Admin Pages
		fetchById: function(id) {
			return $http.get('/api/orders/' + id)
			.then(function(res){
				console.log("The response", res.data)
				return res.data;
			})
		},

		fetchFields: function() {
			return $http.get('/api/orders/fields')
			.then(function(res){
				return res.data;
			})
		},

		deleteOrder: function(orderId) {
			return $http.delete('/api/orders/'+ orderId)
				.then(function(res) {
					console.log(res.data);
					return res.data;
				})
				// .catch(function(err) {
				// 	console.log(err);
				// 	return $q.reject(err);
				// });
		},
		updateOrder: function(order) {
			return $http.put('/api/orders/'+order._id, order)
				.then(function(res) {
					console.log(res.data);
					return res.data;
				})
				.catch(function(err) {
					console.log(err);
				 	return $q.reject(err.data);
				});
		},

		addOrder: function(order) {
			return $http.post('/api/orders', order)
				.then(function(res) {
					console.log(res.data);
					return res.data;
				})
				.catch(function(err) {
					console.log(err);
					return $q.reject(err.data);
				});
		},

		editQuantityInOrder: function(idx, qty, order){

			order.lineItems[idx].quantity = qty;
			return $http.put('/api/orders/' + order._id, order)
				.then(function(res) {
					order = res.data;
					return res.data;
				});
		},

		removeIndexedItemFromOrder: function(idx, order){
			order.lineItems.splice(idx,1);
			return $http.put('/api/orders/' + order._id, order)
				.then(function(res) {
					order = res.data;
					return res.data;
				});
		}



	};
});

