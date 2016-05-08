app.config(function ($stateProvider) {

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'js/signup/signup.html',
        controller: 'SignupCtrl'
    });

    $stateProvider.state('signedUp', {
        url: '/signedUp',
        template: '<div class=well><h3>Signup Successful!</h3>Please check email for activation instructions before proceeding...</div>'
    });

});

app.controller('SignupCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.createAccount = function (userInfo) {

        $scope.error = null;

        AuthService.signup(userInfo).then(function (newUser) {
            $state.go('signedUp');
            // setTimeout(function() {
            //     $state.go('login');
            // },2000);
        }).catch(function (err) {
            $scope.error = err.message;
        });
    };

});