app.directive('ratingStars', function () {
    /**
		Attributes for this directive:
		 - size (xs, sm, md, lg, xl)
		 - updater (a function that will be passed the updated number of stars selected)

		Example markup usage:
		 <rating-stars size="xl" updater="updateReview(<review id>, stars)">

		 The "stars" variable used in the above example is created by the directive and therefore
		 cannot be substituted with any other variable name.
    */

    return {
        restrict: 'E',
        scope: {
        	size: '@',
        	updater: '&'
        },
        templateUrl: 'js/common/directives/rating-stars/rating-stars.html',
        link: function(scope) {
        	if(!scope.size)
        		scope.size = 'lg';
        	
        	scope.id = 'input-'+Math.random().toString(36).slice(3,10);
        	
        	setTimeout(function() {
	        	$("#"+scope.id).rating({
	        		showCaption: false,
	        		clearButton: '',
	        		size: scope.size.toLowerCase()
	        	});
        	}, 0);
        }
    };
});