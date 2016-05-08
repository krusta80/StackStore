app.config(function($stateProvider){

	$stateProvider.state('orderList', {
		url: '/admin/orders',
		controller: 'OrderListCtrl',
		templateUrl: 'js/admin/orders/orders.html',
		resolve: {
			orders: function(OrdersFactory){
				return OrdersFactory.fetchAll();
			},
			fields: function(OrdersFactory){
				return OrdersFactory.fetchFields();
			}
		}
	});
});

app.controller('OrderListCtrl', function($scope, orders, OrdersFactory, fields, $state){
	
	$scope.orders = orders.map(function(order) {
		var filteredOrder = {};
		fields.forEach(function(field) {
			if(typeof order[field] !== 'object' && field !== '_id' && field.indexOf("Id") === -1)
				filteredOrder[field] = order[field];
		});
		return filteredOrder;
	});

	$scope.goToOrder = function(index) {
		console.log("going to index", index);
		if(index == -1)
			return $state.go('orderDetails', {id: "NEW"});
		$state.go('orderDetails', {id: orders[index]._id});
	}

});


