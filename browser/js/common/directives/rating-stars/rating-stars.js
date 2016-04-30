app.directive('ratingStars', function () {
    /**
		Attributes for this directive:
		 - size (xs, sm, md, lg, xl)
		 - updater (a function that will be passed the updated number of stars selected)
		 - total-stars (numeric value, representing the number of stars for this rating -- default is 5)
		 - filled-stars (numeric value, representing the number of filled stars for this rating -- default is 0)
		 - display-only (default is false)
		 - step (star increment size -- default is 1)

		Example markup usage:
		 <rating-stars size="xl" updater="updateReview(<review id>, stars)">

		 The "stars" variable used in the above example is created by the directive and therefore
		 cannot be substituted with any other variable name.
    */

    return {
        restrict: 'E',
        scope: {
        	size: '@',
        	updater: '&',
        	totalStars: '@',
        	filledStars: '@',
        	displayOnly: '@',
        	step: '@'
        },
        templateUrl: 'js/common/directives/rating-stars/rating-stars.html',
        link: function(scope) {
        	
        	if(!scope.step)
        		scope.step = 1;
        	if(!scope.size)
        		scope.size = 'lg';
        	if(!scope.totalStars)
        		scope.totalStars = 5;
        	if(!scope.filledStars)
        		scope.filledStars = 0;
        	if(!scope.displayOnly || scope.displayOnly === 'false')
        		scope.displayOnly = false;
        	
        	scope.stars = scope.filledStars;
        	scope.id = 'input-'+Math.random().toString(36).slice(3,10);

        	console.log(scope);
        	
        	var settings = {
        		showCaption: false,
        		clearButton: '',
        		size: scope.size.toLowerCase(),
        		stars: scope.totalStars,
        		displayOnly: scope.displayOnly,
        		step: scope.step
        	};

        	setTimeout(function() {
	        	console.log(this);
	        	$("#"+scope.id).rating(this);
        	}.bind(settings), 0);
        }
    };
});