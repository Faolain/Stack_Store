app.controller('ShoppingCartController', function ($scope, $stateParams,  $rootScope, ShoppingCart, $http) {

	$scope.items = [];
	$scope.itemQuantity;
  $scope.itemTotal = 0;
  $scope.itemTotalDiscounted = null;

  $scope.getTotal = function(){
      var items = ShoppingCart.getCart();
      items.forEach(function(element){
        $scope.itemTotal += element.price * element.quantity;
      })
  };

  $scope.getDiscountedTotal = function(){
      var items = ShoppingCart.getCart();
      items.forEach(function(element){
        $scope.itemTotal += element.price * element.quantity;
      })
  };

	$scope.getAllItems = function(){
		$scope.items = ShoppingCart.getCart();
    $scope.getTotal();
	};
	$rootScope.$on('updatedShoppingCart',function(){
    $scope.getTotal();
	  $scope.getAllItems();
	});
	$scope.clearCart = function(){
		ShoppingCart.clearCart();
		$scope.getAllItems();
	};

	$scope.removeItem = function(pet){

		ShoppingCart.removeFromCart(pet);
		$scope.getAllItems();
	};
	$scope.updateQuantity = function(item, quant){
		ShoppingCart.updateQuantity(item, quant);
		$scope.getAllItems();
	};

	$scope.sendCartToDB = function(){
		$scope.getAllItems();
		//this needs to be updated to other cart

		$http.put('/api/cart/55391ca6891c507716024fd7',$scope.items)
		.then(function(data){
				console.log('sending data from front end',data);
			})
		.catch(function(err){
				console.error(err);
		});

	};

	$scope.getAllItems();
	if($scope.items.length===0){
		ShoppingCart.retrieveFromDB();
	}

});