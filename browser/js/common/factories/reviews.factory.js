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

	ReviewsFactory.fetchAll = function(){
		return $http.get('/api/reviews')
			.then(function(res){
				return res.data;
			})
			.catch(function(err){
				throw(err);
			});
	}

	ReviewsFactory.fetchHistory = function(origId){
		return $http.get('/api/reviews/'+origId+'/history')
			.then(function(res){
				return res.data;
			})
			.catch(function(err){
				throw(err);
			});
	}

	ReviewsFactory.updateReview = function(review){
		console.log("submitting review...");
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

	ReviewsFactory.fetchFields = function() {
		return $http.get('/api/reviews/fields')
			.then(function(res) {
				return res.data;
			})
			.catch(function(err) {
				console.log(err);
			});
	}

	return ReviewsFactory;
});
