app.factory('CategoriesFactory', function($http){

	var CategoriesFactory = {};
	var currentCategory = null;

	CategoriesFactory.fetchAll = function(){
		return $http.get('/api/categories')
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
		console.log('ihihihi');
		currentCategory = null;
	};

	return CategoriesFactory;

});