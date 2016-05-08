app.config(function ($stateProvider) {
    $stateProvider.state('activation', {
        url: '/activation/:key',
        templateUrl: 'js/activation/activation.html',
        controller: 'ActivationCtrl',
        resolve: {
        	user: function($stateParams, UsersFactory) {
        		return UsersFactory.activate($stateParams.key);
        	}
        }
    });
});

app.controller('ActivationCtrl', function($state, $scope, user) {
	
	$scope.user = user;
	
	if(user.active)
		setTimeout(function() {
			$state.go('login');
		}, 2000);

});