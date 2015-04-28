'use strict';
app.directive('orderForm', function(){
	return { 
		restrict: 'E',
		templateUrl: "js/orders/orderForm.html",
		controller: function($scope, orderFactory, $state){
			$scope.submitOrder = function(){ 
				var order = {};
				order.status = 'Created';
				order.itemList = orderFactory.makeOrderItems($scope.items);
				order.billingAddress = $scope.billingAddress;
				orderFactory.submitOrder(order).then(function(data){
				
					$state.go('home');

			}).catch(function(err){
				console.error('problem with submitting order',err);
			});};
			$scope.billingAddress = {};
			$scope.billingAddress.firstName;
			$scope.billingAddress.lastName;
			$scope.billingAddress.Company;
		    $scope.billingAddress.Address;
		    $scope.billingAddress.Address2;
		    $scope.billingAddress.City;
		    $scope.billingAddress.ZIP;
		    $scope.billingAddress.Country;
		    $scope.billingAddress.State;
		    $scope.billingAddress.Phone;

		}
	};
});

app.factory('orderFactory',function($http){
	return {
		submitOrder: function(order){
			return $http.post('/api/orders',order);
		},
		makeOrderItems: function(items){
			return items.map(function(item){
				var newItem = {};
				console.log('new item id',item);
				newItem.item = item._id;
				newItem.quantity = item.quantity;
				newItem.price = item.price;
				return newItem;
			});

		}
	};

});