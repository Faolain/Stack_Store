
app.controller('OrdersAdminController', function ($scope, $stateParams, OrdersAdminFactory) {
	$scope.orders;
	$scope.statuses = ['Created','Processing','Cancelled','Completed'];
	$scope.currentStatus;

	OrdersAdminFactory.getAllOrders().then(function(orders){
		$scope.orders = orders;

	});
	$scope.filterByStatus = function(status){
		$scope.currentStatus = status;
	};
	$scope.editStatus = function(order,newStatus){
		var orderId = order._id;
		OrdersAdminFactory.changeUserStatus(orderId,newStatus).then(function(data){
			order.status = newStatus;

		}).catch(function(err){
			console.error('there was a problem',err);
		});
	};



		
	$scope.beingEdited = undefined;


});