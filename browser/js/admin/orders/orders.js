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

	$stateProvider.state('orderDetail', {
		url: '/admin/orders/:orderId',
		controller: 'OrderCtrl',
		templateUrl: 'js/admin/orders/orderDetail.html',
		resolve: {
			order: function(OrdersFactory, $stateParams){
				return OrdersFactory.fetchById($stateParams.orderId);
			},
			fields: function(OrdersFactory){
				console.log("Resolve fields")
				return OrdersFactory.fetchFields();
			},
			thisUser: function(AuthService) {
				console.log("Resolve this user")
				return AuthService.getLoggedInUser();
			}
		}
	});
});



//Order History (Can only test from details page - should be pretty simple, uses history template)
//Order Details

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
			return $state.go('orderDetail', {orderId: "NEW"}); 
		$state.go('orderDetail', {orderId: orders[index]._id});
	}

});

app.controller('OrderCtrl', function($scope, order, OrdersFactory, fields, $state, GitCommitted, thisUser){
	var origOrder;
	origOrder = angular.copy(order);
	$scope.thisUser = thisUser;
	$scope.order = order;

	console.log("$scope.order", $scope.order) //POPULATED OBJECT

	$scope.fields = [];
	fields.forEach(function(field) {
		field = {key: field, title: GitCommitted.fancify(field)};
		if(field.key !== '_id' && field.key !== 'dateCreated' && field.key !== 'origId') {
			$scope.fields.push(field);
		}
	});

	var restoreForm = function() {
		order = origOrder;
		origOrder = angular.copy(order);
		$scope.order = order;
	};

	var success = function() {
		$state.go('success');
        setTimeout(function() {
            $state.go('orderList');
        },2000);
	};

	$scope.isTextInput = function(key) {
		return $scope.getOptions(key).length === 0;
	};

	$scope.getOptions = function(key) {
		if(typeof order[key] === 'boolean')
			return [true, false];
		else if(key === 'status')
			return ['Cart', 'Ordered', 'Notified', 'Shipped', 'Delivered', 'Canceled'];
		return [];
	};

	$scope.deleteOrder = function() {
		OrdersFactory.deleteOrder(order._id)
		.then(function(order) {
			console.log("Order deleted successfully!");
			success();
		})
		.catch(function(err) {
			console.log(err);
			$scope.error = err.data;
			restoreForm();
		});
	};
	
	$scope.addUpdateOrder = function() {
		if(order._id)
			OrdersFactory.updateOrder($scope.order)
			.then(function(updatedOrder) {
				console.log("Order updated successfully!");
				success();
			})
			.catch(function(err) {
				console.log(err);
				$scope.error = err.data;
				restoreForm();
			});
		else
			OrdersFactory.addOrders($scope.order)
			.then(function(order) {
				console.log("Order created successfully!");
				success();
			})
			.catch(function(err) {
				$scope.error = err.data;
				restoreForm();
			});
	};

	$scope.setQuantity = function(product, qty){
		console.log("Called set Quantity ", qty, " on product: ", product)
		OrdersFactory.editQuantityInOrder(product, qty, $scope.order._id)
		.then(function(updatedCart){
			return OrdersFactory.getOrder(updatedCart.id)
		})
		.then(function(populatedCart){
			$scope.cart = populatedCart;
		})
	}

	$scope.deleteItem = function(idx) {
		OrdersFactory.removeIndexedItemFromOrder(idx, $scope.order)
		.then(function(updatedOrder) {
			return OrdersFactory.getOrder(updatedOrder._id)
		})
		.then(function(populatedOrder) {
			$scope.order = populatedOrder;
		})
	};
	
});



