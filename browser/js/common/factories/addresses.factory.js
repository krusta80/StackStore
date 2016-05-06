app.factory('AddressesFactory', function($http, $rootScope){

	return{
		findByUserId: function(id){
			return $http.get('/api/addresses/user/' + id)
			.then(function(res){
				console.log(res.data);
				return res.data;
			})
		}, 

		findOrCreate: function(obj){
			return $http.post('/api/addresses', obj)
				.then(function(res) {
					return res.data;
				});
		}
	}
});

