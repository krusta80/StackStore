app.config(function($stateProvider){

	$stateProvider.state('categories.products', {
		url: '/:categoryId/products',
		controller: 'ProductsByCategoryCtrl',
		templateUrl: 'js/products/productsByCategory.html',
		resolve: {
			products: function($stateParams, ProductsFactory){
				return ProductsFactory.fetchByCategory($stateParams.categoryId);
			}
		}
	});

});

app.controller('ProductsByCategoryCtrl', function(OrdersFactory, $scope, $stateParams, products, CategoriesFactory){

	CategoriesFactory.setCurrentCategory($stateParams.categoryId);
	$scope.products = products;

	$scope.addToCart = function(product) {
		console.log("productId",product._id);
		OrdersFactory.addToCart(product);

	};

	$scope.showCategories = function(categories){
		var categoriesName = categories.map(function(category){
			return category.name;
		});
		return categoriesName.join(', ');
	};

});