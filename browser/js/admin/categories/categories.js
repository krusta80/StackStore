app.config(function($stateProvider){

	$stateProvider.state('categoryList', {
		url: '/admin/categories',
		controller: 'CategoryListCtrl',
		templateUrl: 'js/admin/categories/categories.html',
		resolve: {
			categories: function(CategoriesFactory){
				return CategoriesFactory.fetchAll();
			},
			fields: function(CategoriesFactory){
				return CategoriesFactory.fetchFields();
			}
		}
	});

	$stateProvider.state('categoryDetail', {
		url: '/admin/categories/:categoryId',
		controller: 'CategoryCtrl',
		templateUrl: 'js/admin/categories/categoryDetail.html',
		resolve: {
			category: function(CategoriesFactory, $stateParams){
				if($stateParams.categoryId === "NEW")
					return {active: true};
				return CategoriesFactory.fetchById($stateParams.categoryId);
			},
			fields: function(CategoriesFactory){
				return CategoriesFactory.fetchFields();
			},
			thisUser: function(AuthService) {
				return AuthService.getLoggedInUser();
			}
		}
	});
});

app.controller('CategoryListCtrl', function($scope, categories, CategoriesFactory, fields, $state){
	
	$scope.categories = categories.map(function(category) {
		var filteredCategory = {};
		fields.forEach(function(field) {
			filteredCategory[field] = category[field];
		});
		return filteredCategory;
	});

	$scope.goToCategory = function(index) {
		console.log("going to index", index);
		if(index == -1)
			return $state.go('categoryDetail', {categoryId: "NEW"});
		$state.go('categoryDetail', {categoryId: categories[index]._id});
	}

});

app.controller('CategoryCtrl', function($scope, category, CategoriesFactory, fields, $state, GitCommitted, thisUser){
	var origCategory;
	origCategory = angular.copy(category);
	$scope.thisUser = thisUser;
	$scope.category = category;
	$scope.fields = [];
	fields.forEach(function(field) {
		field = {key: field, title: GitCommitted.fancify(field)};
		if(field.key !== '_id' && field.key !== 'dateCreated' && field.key !== 'dateModified' && field.key !== 'origId') {
			$scope.fields.push(field);
		}
	});

	console.log($scope.category);

	var restoreForm = function() {
		category = origCategory;
		origCategory = angular.copy(category);
		$scope.category = category;
	};

	var success = function() {
		$state.go('success');
        setTimeout(function() {
            $state.go('categoryList');
        },2000);
	};

	$scope.isTextInput = function(key) {
		return $scope.getOptions(key).length === 0;
	};

	$scope.getOptions = function(key) {
		if(typeof category[key] === 'boolean')
			return [true, false];
		return [];
	};

	$scope.deleteCategory = function() {
		CategoriesFactory.deleteCategory(category._id)
		.then(function(category) {
			console.log("Category deleted successfully!");
			success();
		})
		.catch(function(err) {
			console.log(err);
			$scope.error = err.data;
			restoreForm();
		});
	};
	
	$scope.addUpdateCategory = function() {
		if(category._id)
			CategoriesFactory.updateCategory($scope.category)
			.then(function(updatedCategory) {
				console.log("Category updated successfully!");
				success();
			})
			.catch(function(err) {
				console.log(err);
				$scope.error = err.data;
				restoreForm();
			});
		else
			CategoriesFactory.createCategory($scope.category)
			.then(function(category) {
				console.log("Category created successfully!");
				success();
			})
			.catch(function(err) {
				$scope.error = err.data;
				restoreForm();
			});
	};
	
});

