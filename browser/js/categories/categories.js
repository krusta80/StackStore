app.config(function($stateProvider){

	$stateProvider.state('categories', {
		url: '/categories',
		controller: 'CategoriesCtrl',
		templateUrl: 'js/categories/categories.html',
		resolve: {
			categories: function(CategoriesFactory){
				return CategoriesFactory.fetchAll();
			}
		}
	});

});

app.controller('CategoriesCtrl', function($scope, categories, CategoriesFactory){

	$scope.categories = categories;

	$scope.fetchCurrentCategory = function(){
		return CategoriesFactory.fetchCurrentCategory();
	};

});