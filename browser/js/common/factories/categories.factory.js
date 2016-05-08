app.factory('CategoriesFactory', function($http){

	var CategoriesFactory = {};
	var currentCategory = null;

	CategoriesFactory.fetchAll = function(){
		return $http.get('/api/categories')
				.then(function(res){
					return res.data;
				});
	};

	CategoriesFactory.fetchFields = function(){
		return $http.get('/api/categories/fields')
				.then(function(res){
					return res.data;
				});
	};

	CategoriesFactory.fetchById = function(id){
		return $http.get('/api/categories/' + id)
				.then(function(res){
					return res.data;
				});
	};

	CategoriesFactory.fetchHistory = function(origId){
		return $http.get('/api/categories/' + origId + '/history')
				.then(function(res){
					return res.data;
				});
	};

	CategoriesFactory.setCurrentCategory = function(categoryId){
		currentCategory = categoryId;
	};

	CategoriesFactory.fetchCurrentCategory = function(){
		return currentCategory;
	};

	CategoriesFactory.clearCurrentCategory = function(){
		currentCategory = null;
	};

	CategoriesFactory.updateCategory = function(category){
		return $http.put('/api/categories/'+category._id, category)
			.then(function(res){
				return res.data;
			})
	}

	CategoriesFactory.createCategory = function(category){
		return $http.post('/api/categories', category)
			.then(function(res){
				return res.data;
			})
	}

	CategoriesFactory.deleteCategory = function(id) {
		return $http.delete('/api/categories/' + id)
				.then(function(res){
					return res.data;
				});
	}

	return CategoriesFactory;

});