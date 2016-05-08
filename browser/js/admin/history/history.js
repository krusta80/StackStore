app.controller('HistoryCtrl', function($scope, history, fields, origId, model, $state){
	
	$scope.origId = origId;
	$scope.model = model;
	$scope.rows = history.map(function(row) {
		var filteredRow = {};
		fields.forEach(function(field) {
			filteredRow[field] = row[field];
		});
		return filteredRow;
	});

	$scope.goBack = function() {
		$state.go(model.toLowerCase()+'List');
	};
});
