app.factory('ProductsFactory', function($http){

	var ProductsFactory = {};

	ProductsFactory.fetchByCategory = function(categoryId){
		return $http.get('/api/products/category/' + categoryId)
				.then(function(res){
					return res.data;
				});
	}

	return ProductsFactory;

});