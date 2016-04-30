app.directive('ratingStars', function () {
    return {
        restrict: 'E',
        scope: {
        	size: '@'
        },
        templateUrl: 'js/common/directives/rating-stars/rating-stars.html',
        link: function(scope) {
        	if(!scope.size)
        		scope.size = 'xl';
        	
        	//scope.id = 'input-'+Math.random().toString(36).slice(3,10);
        	scope.id = 'input-id';
        	console.log(scope.id);
        	
        	$("#input-id").rating({
        		showCaption: false,
        		clearButton: '',
        		size: scope.size
        	});
        }
    };
});