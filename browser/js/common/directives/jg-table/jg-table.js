app.directive('jgTable', function () {
    /**
		Attributes for this directive:
		 -- table-title (string)
         -- table-data (array of objects with identical keys)
         -- table-callback (function to be triggered when a row is clicked)

		Example markup usage:
		 <jg-table table-name="users" table-title="Add/Change/Remove Users - Click a Row to Begin" table-data="users" table-callback="goToUser()">

    */

    return {
        restrict: 'E',
        scope: {
        	tableTitle: '@',
        	tableData: '=',
        	tableCallback: '&'
        },
        templateUrl: 'js/common/directives/jg-table/jg-table.html',
        controller: 'JGController'
    };
});

app.controller('JGController', function($scope, GitCommitted){
    
    if($scope.tableData.length > 0) {
        $scope.cols = Object.keys($scope.tableData[0]).map(function(key) {
            return {
                key: key,
                title: GitCommitted.fancify(key)
            };
        });
        
        $scope.rows = [];
        for(var i = 0; i < $scope.tableData.length; i++) {
            $scope.rows[i] = $scope.tableData[i];
            $scope.rows[i].index = i;
        };
    }
    
});