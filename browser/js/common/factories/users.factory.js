app.factory('UsersFactory', function($http){

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
		fetchFields: function() {
			return $http.get('/api/users/fields')
				.then(function(res) {
					users = res.data;
					return res.data;
				})
				.catch(function(err) {
					console.log(err);
				});
		}
	};
});