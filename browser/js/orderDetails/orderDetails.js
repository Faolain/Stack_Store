'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('order_details', {
        url: '/order/:orderID',
        controller: "OrderDetailsController",
        templateUrl: 'js/orderDetails/orderDetails.html'
    });
});

app.controller('OrderDetailsController', function ($scope, $stateParams, OrdersAdminFactory) {

	OrdersAdminFactory.getOrderByID( $stateParams.orderID ).then(function(order){
		$scope.order = order;
	}).catch(function(err){
		console.error('there was an error with getting order',err);
	});

});