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

app.controller('JGController', function($scope){
    
    var fancify = function(field) {
        //  converts from camel case to english
        return field
                // insert a space before all caps
                .replace(/([A-Z])/g, ' $1')
                // uppercase the first character
                .replace(/^./, function(str){ return str.toUpperCase(); })
    };

    if($scope.tableData.length > 0) {
        $scope.cols = Object.keys($scope.tableData[0]).map(function(key) {
            return {
                key: key,
                title: fancify(key)
            };
        });
        $scope.rows = $scope.tableData;
    }
    
});