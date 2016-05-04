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

	ProductsFactory.addReview = function(product){
		return $http.put('/api/products/'+product._id, product)
			.then(function(res){
				return res.data;
			})
	}

	return ProductsFactory;

});