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

app.controller('ProductsByCategoryCtrl', function(OrdersFactory, $scope, $stateParams, products, CategoriesFactory){

	CategoriesFactory.setCurrentCategory($stateParams.categoryId);
	$scope.products = products;

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

	$scope.currentImage = $scope.product.imageUrls[0];
	$scope.nextImage = function(){
		console.log('next');
		$scope.product.imageUrls.forEach(function(imgUrl, index){
			if($scope.currentImage === imgUrl){
				if(index === $scope.product.imageUrls.length - 1){
					console.log('last one');
					return $scope.currentImage = $scope.product.imageUrls[0];
				}
				else{
					console.log('not');
					return $scope.currentImage = $scope.product.imageUrls[index + 1];	
				}
			}			
		});
	};
	$scope.previousImage = function(){
		console.log('previous')
		$scope.product.imageUrls.forEach(function(imgUrl, index){
			if($scope.currentImage === imgUrl){
				if(index === 0)
					return $scope.currentImage = $scope.product.imageUrls[$scope.product.imageUrls.length - 1];
				else
					return $scope.currentImage = $scope.product.imageUrls[index - 1];	
			};			
		});
	};

});



