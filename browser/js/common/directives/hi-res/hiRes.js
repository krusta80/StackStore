app.directive('hiRes', function() {
  return {
    restrict: 'A',
    scope: { hiRes: '@' },
    link: function(scope, element, attrs) {
        element.one('load', function() {
            element.attr('src', scope.hiRes);
        });
    }
  };
});