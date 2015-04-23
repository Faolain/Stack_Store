app.controller('ShoppingCartController', function ($scope, $stateParams,  $rootScope, ShoppingCart, $http) {
	$scope.items = [];
	$scope.itemQuantity;
	$scope.getAllItems = function(){
		$scope.items = ShoppingCart.getCart();
	};
	$rootScope.$on('updatedShoppingCart',function(){
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
		console.log("HELLO");
		$scope.getAllItems();
		$http.put('/api/cart/updateCart/55391ca8891c507716024fd9',$scope.items)
		.then(function(data){
				console.log('sending data from front end',data);
			})
		.catch(function(err){
				console.error(err);
		});

	};
	$scope.getAllItems();

});