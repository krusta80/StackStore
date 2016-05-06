app.config(function($stateProvider){

	$stateProvider.state('userList', {
		url: '/admin/users',
		controller: 'UserListCtrl',
		templateUrl: 'js/admin/users/users.html',
		resolve: {
			users: function(UsersFactory){
				return UsersFactory.fetchUsers();
			},
			fields: function(UsersFactory){
				return UsersFactory.fetchFields();
			}
		}
	});
});

app.controller('UserListCtrl', function($scope, users, UsersFactory, fields){
	
	$scope.users = users.map(function(user) {
		var filteredUser = {};
		fields.forEach(function(field) {
			filteredUser[field] = user[field];
		});
		return filteredUser;
	});

	$scope.goToUser = function(index) {
		console.log("Index clicked is "+index);
	}

});


 