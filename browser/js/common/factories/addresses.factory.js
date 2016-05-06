app.factory('AddressesFactory', function($http, $rootScope){

	return{
		findOrCreate: function(obj){
			return $http.post('/api/addresses', obj)
				.then(function(res) {
					return res.data;
				});
		}
	}
});

