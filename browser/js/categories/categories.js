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

app.controller('CategoriesCtrl', function($scope, categories, CategoriesFactory, $state){

	CategoriesFactory.clearCurrentCategory();

	$scope.categories = categories;

	console.log($state.$current);

 	$scope.fetchCurrentCategory = function(){
		return CategoriesFactory.fetchCurrentCategory();
	};

	if(!$scope.fetchCurrentCategory() && categories.length > 0 && $state.$current.name === 'categories') { 		
		$state.go('categories.products', {categoryId: categories[0]._id});
 	}

	
});