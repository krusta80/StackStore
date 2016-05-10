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

	$stateProvider.state('userHistory', {
		url: '/admin/users/:origId/history',
		controller: 'HistoryCtrl',
		templateUrl: 'js/admin/history/history.html',
		resolve: {
			history: function(UsersFactory, $stateParams){
				return UsersFactory.fetchHistory($stateParams.origId);
			},
			fields: function(UsersFactory){
				return UsersFactory.fetchFields();
			},
			origId: function($stateParams) {
				return $stateParams.origId
			},
			model: function() {
				return "User"
			}
		}
	});

	$stateProvider.state('userDetail', {
		url: '/admin/users/:userId',
		controller: 'UserCtrl',
		templateUrl: 'js/admin/users/userDetail.html',
		resolve: {
			user: function(UsersFactory, $stateParams){
				if($stateParams.userId === "NEW")
					return {active: true, pendingPasswordReset: true, role: 'User'};
				return UsersFactory.fetchById($stateParams.userId);
			},
			fields: function(UsersFactory){
				return UsersFactory.fetchFields();
			},
			thisUser: function(AuthService) {
				return AuthService.getLoggedInUser();
			}
		}
	});

	$stateProvider.state('success', {
        url: '/success',
        template: '<div class=well><h3>Add/Edit/Remove Successful!</h3>Rerouting you to list...</div>'
    });

});

app.controller('UserListCtrl', function($scope, users, UsersFactory, fields, $state){
	
	$scope.users = users.map(function(user) {
		var filteredUser = {};
		fields.forEach(function(field) {
			if(field !== 'password')
				filteredUser[field] = user[field];
		});
		return filteredUser;
	});

	$scope.goToUser = function(index) {
		if(index == -1)
			return $state.go('userDetail', {userId: "NEW"});
		$state.go('userDetail', {userId: users[index]._id});
	}

});

app.controller('UserCtrl', function($scope, user, UsersFactory, fields, $state, GitCommitted, thisUser){
	var origUser;
	origUser = angular.copy(user);
	$scope.thisUser = thisUser;
	$scope.user = user;
	$scope.fields = [];
	fields.forEach(function(field) {
		field = {key: field, title: GitCommitted.fancify(field)};
		if(field.key !== '_id' && field.key !== 'dateCreated' && field.key !== 'origId') {
			$scope.fields.push(field);
		}
	});

	console.log($scope.user);

	var restoreForm = function() {
		user = origUser;
		origUser = angular.copy(user);
		$scope.user = user;
	};

	var success = function() {
		$state.go('success');
        setTimeout(function() {
            $state.go('userList');
        },2000);
	};

	$scope.isTextInput = function(key) {
		return $scope.getOptions(key).length === 0;
	};

	$scope.getHistory = function() {
		$state.go('userHistory', {origId: user.origId});
	};

	$scope.getOptions = function(key) {
		if(typeof user[key] === 'boolean')
			return [true, false];
		else if(key === 'role')
			return ['User', 'Admin'];
		return [];
	};

	$scope.deleteUser = function() {
		UsersFactory.deleteUser(user._id)
		.then(function(user) {
			console.log("User deleted successfully!");
			success();
		})
		.catch(function(err) {
			console.log(err);
			$scope.error = GitCommitted.errorify(err.data);
			restoreForm();
		});
	};
	
	$scope.addUpdateUser = function() {
		if(user._id)
			UsersFactory.updateUser($scope.user)
			.then(function(updatedUser) {
				console.log("User updated successfully!");
				success();
			})
			.catch(function(err) {
				console.log(err);
				$scope.error = GitCommitted.errorify(err.data);
				restoreForm();
			});
		else
			UsersFactory.addUser($scope.user)
			.then(function(user) {
				console.log("User created successfully!");
				success();
			})
			.catch(function(err) {
				$scope.error = GitCommitted.errorify(err.data);
				restoreForm();
			});
	};
	
});

