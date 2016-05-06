app.factory('ReviewsFactory', function($http){
	var ReviewsFactory = {};

	var review;

	ReviewsFactory.submitReview = function(review){
		return $http.post('/api/reviews', review)
			.then(function(res){
				return res.data;
			})
			.catch(function(err){
				throw(err);
			});
	}

	ReviewsFactory.fetchById = function(id){
		return $http.get('/api/reviews/'+id)
			.then(function(res){
				return res.data;
			})
			.catch(function(err){
				throw(err);
			});
	}

	ReviewsFactory.updateReview = function(review){
		return $http.put('/api/reviews/'+review._id, review)
			.then(function(res){
				return res.data;
			})
			.catch(function(err){
				throw(err);
			});
	}

	ReviewsFactory.deleteReview = function(review){
		return $http.delete('/api/reviews/'+review._id)
			.then(function(res){
				return res.data;
			})
			.catch(function(err){
				throw(err);
			});
	}

	return ReviewsFactory;
});
