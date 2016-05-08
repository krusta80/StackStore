app.factory('UsersFactory', function($http, $q){

	var users;

	return {
		fetchUsers: function() {
			return $http.get('/api/users')
				.then(function(res) {
					users = res.data;
					return res.data;
				})
				.catch(function(err) {
					console.log(err);
				});
		},
		activate: function(key) {
			return $http.get('/api/users/activation/'+key)
				.then(function(res) {
					return res.data;
				})
				.catch(function(err) {
					console.log(err);
				});
		}, 
		fetchById: function(userId) {
			return $http.get('/api/users/'+userId)
				.then(function(res) {
					console.log(res.data);
					return res.data;
				})
				.catch(function(err) {
					console.log(err);
				});
		},
		fetchFields: function() {
			return $http.get('/api/users/fields')
				.then(function(res) {
					users = res.data;
					return res.data;
				})
				.catch(function(err) {
					console.log(err);
				});
		},
		fetchHistory: function(origId) {
			return $http.get('/api/users/'+origId+'/history')
				.then(function(res) {
					users = res.data;
					return res.data;
				})
				.catch(function(err) {
					console.log(err);
				});
		},
		deleteUser: function(userId) {
			return $http.delete('/api/users/'+userId)
				.then(function(res) {
					console.log(res.data);
					return res.data;
				})
				.catch(function(err) {
					console.log(err);
					return $q.reject(err);
				});
		},
		updateUser: function(user) {
			return $http.put('/api/users/'+user._id, user)
				.then(function(res) {
					console.log(res.data);
					return res.data;
				})
				.catch(function(err) {
					console.log(err);
					return $q.reject(err);
				});
		},
		addUser: function(user) {
			return $http.post('/api/users', user)
				.then(function(res) {
					console.log(res.data);
					return res.data;
				})
				.catch(function(err) {
					console.log(err);
					return $q.reject(err);
				});
		}
	};
});