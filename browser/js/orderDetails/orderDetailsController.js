app.controller('OrderDetailsController', function ($scope, $stateParams, OrdersAdminFactory) {

  $scope.totalPrice = 0;

	OrdersAdminFactory.getOrderByID( $stateParams.orderID ).then(function(order){
		$scope.order = order;
    order.itemList.forEach(function(elem){
      $scope.totalPrice += (elem.quantity*elem.price);
    });
	}).catch(function(err){
		console.error('there was an error with getting order',err);
	});

});