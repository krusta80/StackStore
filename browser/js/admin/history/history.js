app.controller('HistoryCtrl', function($scope, history, fields, $state){
	
	$scope.rows = history.map(function(row) {
		var filteredRow = {};
		fields.forEach(function(field) {
			filteredRow[field] = row[field];
		});
		return filteredRow;
	});

	// $scope.goToCategory = function(index) {
	// 	console.log("going to index", index);
	// 	if(index == -1)
	// 		return $state.go('categoryDetail', {categoryId: "NEW"});
	// 	$state.go('categoryDetail', {categoryId: categories[index]._id});
	// }

});
