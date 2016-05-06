app.factory('ProductsFactory', function($http){

	var ProductsFactory = {};

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

	ProductsFactory.updateProduct = function(product){
		return $http.put('/api/products/'+product._id, product)
			.then(function(res){
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

	return ProductsFactory;

});