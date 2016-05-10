app.factory('ProductsFactory', function($http){

	var ProductsFactory = {};
	var productsCache = [];

	var findIndex = function(items, newItem) {
		for(var i = 0; i < items.length; i++)
			if(items[i].origId === newItem.origId)
				return i;
		return -1;
	}


	ProductsFactory.fetchByCategory = function(categoryId){
		return $http.get('/api/products/category/' + categoryId)
				.then(function(res){
					return res.data;
				});
	}

	ProductsFactory.fetchById = function(id){
		return $http.get('/api/products/' + id)
				.then(function(res){
					return res.data;
				});
	}

	ProductsFactory.fetchAll = function(){
		if(productsCache.length > 0) {
			console.log("retrieving cached products...");
			return productsCache;
		}
		return $http.get('/api/products')
				.then(function(res){
					productsCache = res.data;
					return res.data;
				});
	}

	ProductsFactory.fetchHistory = function(origId){
		return $http.get('/api/products/' + origId + '/history')
				.then(function(res){
					return res.data;
				});
	}

	ProductsFactory.fetchFields = function(){
		return $http.get('/api/products/fields')
				.then(function(res){
					return res.data;
				});
	}

	ProductsFactory.updateProduct = function(product){
		return $http.put('/api/products/'+product._id, product)
			.then(function(res){
				var index = findIndex(productsCache, res.data);
				if(index > -1) 
					productsCache[index] = res.data;
				return res.data;
			})
	}

	ProductsFactory.createProduct = function(product){
		return $http.post('/api/products', product)
			.then(function(res){
				productsCache.push(res.data);
				return res.data;
			})
	}

	ProductsFactory.searchProducts = function(searchString) {
		console.log("Searching", searchString);
		return $http.get('/api/products/search/'+searchString)
			.then(function(res) {
				return res.data;
			});
	}

	ProductsFactory.deleteProduct = function(id) {
		return $http.delete('/api/products/' + id)
				.then(function(res){
					var index = findIndex(productsCache, res.data);
					if(index > -1) 
						productsCache.splice(index,1);
					return res.data;
				});
	}

	return ProductsFactory;

});