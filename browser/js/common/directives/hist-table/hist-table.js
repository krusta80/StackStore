app.directive('histTable', function () {
    /**
		Attributes for this directive:
		 -- table-title (string)
         -- table-data (array of objects with identical keys)
         
		Example markup usage:
		 <hist-table table-title="User History" table-data="userHist">

    */

    return {
        restrict: 'E',
        scope: {
        	tableTitle: '@',
        	tableData: '='
        },
        templateUrl: 'js/common/directives/hist-table/hist-table.html',
        controller: 'HistController'
    };
});

app.controller('HistController', function($scope, GitCommitted){
    
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