app.directive('orderDetails',function(){
	return {
		templateUrl: 'js/orderDetails/orderDetailsTemplate.html',
		restrict: 'E',
		controller: function ($scope, $stateParams, OrdersAdminFactory) {
	
			OrdersAdminFactory.getOrderByID( $stateParams.orderID ).then(function(order){
				$scope.order = order;
			}).catch(function(err){
				console.error('there was an error with getting order',err);
			});

		}
	};
});