'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('orders', {
        url: '/orders',
        controller: "OrdersAdminController",
        templateUrl: 'js/orderAdmin/orderAdmin.html'

    });
});

app.controller('OrdersAdminController', function ($scope, $stateParams, OrdersAdminFactory) {
	$scope.orders;


	OrdersAdminFactory.getAllOrders().then(function(orders){
		$scope.orders = orders;
		console.log(typeof orders);

	});

	$scope.editStatus = function(order,newStatus){
		var orderId = order._id;
		OrdersAdminFactory.changeUserStatus(orderId,newStatus).then(function(data){
			order.status = newStatus;
			console.log('we have successfully changed the status',data);

		}).catch(function(err){
			console.error('there was a problem',err);
		});
	};



		
	$scope.beingEdited = undefined;


});