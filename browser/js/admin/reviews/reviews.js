app.config(function($stateProvider){

	$stateProvider.state('reviewList', {
		url: '/admin/reviews',
		controller: 'ReviewListCtrl',
		templateUrl: 'js/admin/reviews/reviews.html',
		resolve: {
			reviews: function(ReviewsFactory){
				return ReviewsFactory.fetchAll();
			},
			fields: function(ReviewsFactory){
				return ReviewsFactory.fetchFields();
			}
		}
	});
});

app.controller('ReviewListCtrl', function($scope, reviews, ReviewsFactory, fields, $state){
	
	$scope.reviews = reviews.map(function(review) {
		var filteredReview = {};
		fields.forEach(function(field) {
			filteredReview[field] = review[field];
		});
		return filteredReview;
	});

	$scope.goToReview = function(index) {
		if(index == -1)
			return $state.go('addReviews', {productId: "NEW"});
		$state.go('editReviews', {productId: reviews[index].product, reviewId: reviews[index]._id});
	}

});


