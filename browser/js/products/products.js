app.config(function($stateProvider){

	$stateProvider.state('productSearch', {
		url: '/products/search/:string',
		controller: 'ProductsByCategoryCtrl',
		templateUrl: 'js/products/productsByCategory.html',
		resolve: {
			products: function($stateParams, ProductsFactory){
				return ProductsFactory.searchProducts($stateParams.string);
			}
		}
	});

	$stateProvider.state('categories.products', {
		url: '/:categoryId/products',
		controller: 'ProductsByCategoryCtrl',
		templateUrl: 'js/products/productsByCategory.html',
		resolve: {
			products: function($stateParams, ProductsFactory){
				return ProductsFactory.fetchByCategory($stateParams.categoryId);
			},
			user: function(AuthService){
				return AuthService.getLoggedInUser();
			}
		}
	});

	$stateProvider.state('product', {
		url: '/product/:id',
		controller: 'ProductCtrl',
		templateUrl: 'js/products/product.html',
		resolve: {
			product: function($stateParams, ProductsFactory){
				return ProductsFactory.fetchById($stateParams.id);
			}
		}
	});

});

app.controller('ProductsByCategoryCtrl', function(OrdersFactory, $scope, $stateParams, products, user, CategoriesFactory){

	CategoriesFactory.setCurrentCategory($stateParams.categoryId);
	$scope.products = products;
	$scope.user = user;
	console.log(user);


	$scope.addToCart = function(product) {
		OrdersFactory.addToCart(product);

	};

	$scope.scaleDown = function(imgUrl) {
		return imgUrl.replace(/640/, '230').replace(/480/, '172');
	};

	$scope.showCategories = function(categories){
		var categoriesName = categories.map(function(category){
			return category.name;
		});
		return categoriesName.join(', ');
	};

});


app.controller('ProductCtrl', function($scope, product, $state, AuthService){

	$scope.product = product;
	console.log(product);
	AuthService.getLoggedInUser().then(function(user){
		$scope.user = user;
		console.log(user);
	})

	$scope.getQuantityArray = function(){
		var quantity = [];
		for(var i = 1; i < $scope.product.inventoryQty + 1; i++){
			quantity.push(i);
		}
		return quantity;
	};

	$scope.addToCart = function(){
		console.log($scope.selectedQuantity);
	}

	$scope.roundStars = function(stars) {
		return Math.round(stars*10)/10;
	};

	$scope.addReview = function() {
		$state.go('addReviews', {productId: product._id});
	};



});



