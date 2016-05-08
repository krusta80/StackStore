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

	$stateProvider.state('reviewHistory', {
		url: '/admin/reviews/:origId/history',
		controller: 'HistoryCtrl',
		templateUrl: 'js/admin/history/history.html',
		resolve: {
			history: function(ReviewsFactory, $stateParams){
				console.log("origId is", $stateParams.origId);
				return ReviewsFactory.fetchHistory($stateParams.origId);
			},
			fields: function(ReviewsFactory){
				return ReviewsFactory.fetchFields();
			},
			origId: function($stateParams) {
				return $stateParams.origId
			},
			model: function() {
				return "Review"
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


