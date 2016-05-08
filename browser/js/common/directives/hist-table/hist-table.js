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

    var isEqual = function(a, b) {
        if(a instanceof Array) {
            
            if(!(b instanceof Array))
                return false;
            if(a.length !== b.length)
                return false;

            //  we are comparing arrays
            var isGood = true;
            for(var i = 0; i < a.length; i++)
                isGood = isGood && (a[i] === b[i]);
            return isGood;
        }
        return a === b;
    };

    $scope.dateify = GitCommitted.dateify;

    $scope.wasChanged = function(row, colName) {
        var changed = false;

        if(row > 0)
            changed = changed || !isEqual($scope.rows[row-1][colName],$scope.rows[row][colName]); 
        if(row < $scope.rows.length - 1)
            changed = changed || !isEqual($scope.rows[row+1][colName], $scope.rows[row][colName]); 
        return changed;
    };

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