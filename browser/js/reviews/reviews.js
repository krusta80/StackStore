app.config(function($stateProvider){
	$stateProvider
		.state('addReviews', {
			url: '/products/:productId/reviews',
			controller: 'ReviewsCtrl',
			templateUrl: 'js/reviews/editOrAdd.html',
			resolve: {
				review: function(){
					return {}
				}
			}
		})
		.state('editReviews', {
			url: '/products/:productId/reviews/:reviewId',
			controller: 'ReviewsCtrl',
			templateUrl: 'js/reviews/editOrAdd.html',
			resolve: {
				review: function(ReviewsFactory, $stateParams){
					return ReviewsFactory.fetchById($stateParams.reviewId)
				}
			}
		})
});

app.controller('ReviewsCtrl', function($scope, $stateParams, $state, ProductsFactory, ReviewsFactory, AuthService, review){
	$scope.review = review;
	ProductsFactory.fetchById($stateParams.productId)
		.then(function(product){
			$scope.product = product;
			$scope.review.product = $scope.product._id;
		})
		.catch(function(err){
			console.log("Error: ",err)
		});
	AuthService.getLoggedInUser().then(function(user){
		$scope.review.user = user;
	})
	$scope.submitReview = function(){
		if($stateParams.reviewId){//This is for editing existing reviews
			ReviewsFactory.updateReview($scope.review)
				.then(function(review){
					$state.go('product', {id: $scope.product._id})
				})
		}
		else{//This is for new reviews
			ReviewsFactory.submitReview($scope.review)
				.then(function(review){
					$scope.product.reviews.push(review);
					return ProductsFactory.addReview($scope.product)
				})
				.then(function(product){
					$state.go('product', {id: product._id})
				})
				.catch(function(err){
					console.log(err);
				})
			}
	}
	$scope.updateReview = function(stars){
		$scope.review.stars=stars;
		console.log($scope.review);
	}
	//fetch the product in a resolve
	//572818ed6954b9627acd9b98/reviews
});