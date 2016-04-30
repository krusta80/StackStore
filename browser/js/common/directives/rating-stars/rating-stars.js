app.directive('ratingStars', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/rating-stars/rating-stars.html',
        link: function(scope) {
        	$("#input-id").rating({
        		showCaption: false,
        		clearButton: ''
        	});
        }
    };
});