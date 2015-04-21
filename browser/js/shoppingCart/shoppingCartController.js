app.controller('ShoppingCartController', function ($scope, $stateParams,  $rootScope, ShoppingCart) {
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
	$scope.getAllItems();

});