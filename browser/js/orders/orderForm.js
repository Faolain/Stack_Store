'use strict';
app.directive('orderForm', function(){
	return {
		restrict: 'E',
		templateUrl: "js/orders/orderForm.html",
		controller: function($scope, orderFactory, $state, $http){

      $scope.promoError = "";

      $scope.promoApplication;

      $scope.applyPromo = function(promo){
        return $http.get('/api/promos/'+promo).then(function (response) {
          if (!response.data[0]){
            $scope.itemTotalDiscounted = "";
            $scope.promoError = "Sorry that promo is not valid";
          } else {
            var discountPercent = (response.data[0].discount/100);
            $scope.itemTotalDiscounted = $scope.itemTotal - ($scope.itemTotal * discountPercent);
            $scope.promoError = "";
            $scope.promoApplication = response.data[0]._id
          }
        });
      };

      $scope.getPromoId = function(promo){
        return $http.get('/api/promos/'+promo).then(function (response) {
          return response.data[0]._id;
        });
      };

			$scope.submitOrder = function(promo_name){
				var order = {};
				order.status = 'Created';
				order.itemList = orderFactory.makeOrderItems($scope.items);
				order.billingAddress = $scope.billingAddress;
        order.promo = $scope.promoApplication;
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
				newItem.item = item._id;
				newItem.quantity = item.quantity;
				newItem.price = item.price;
				return newItem;
			});

		},
    getPromoId: function(order){
      return $http.post('/api/orders',order);
    }
	};

});