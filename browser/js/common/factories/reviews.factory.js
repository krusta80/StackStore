app.factory('ReviewsFactory', function($http){
	var ReviewsFactory = {};

	var review;
	var reviewsCache = [];

	var findIndex = function(items, newItem) {
		for(var i = 0; i < items.length; i++)
			if(items[i].origId === newItem.origId)
				return i;
		return -1;
	}

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
		if(reviewsCache.length > 0) {
			console.log("retrieving cached reviews...");
			return reviewsCache;
		}
		return $http.get('/api/reviews')
			.then(function(res){
				reviewsCache = res.data;
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
				var index = findIndex(reviewsCache, res.data);
				if(index > -1) 
					reviewsCache[index] = res.data;
					
				return res.data;
			})
			.catch(function(err){
				throw(err);
			});
	}

	ReviewsFactory.deleteReview = function(review){
		return $http.delete('/api/reviews/'+review._id)
			.then(function(res){
				var index = findIndex(reviewsCache, res.data);
				if(index > -1)
					reviewsCache.splice(index,1);
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
