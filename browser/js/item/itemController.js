app.controller('itemController', function($scope, ShoppingCart, $rootScope) {
  $scope.shoppingCart = ShoppingCart;
  $scope.addToCart = function(pet){
  	ShoppingCart.addToCart(pet);
  	$rootScope.$broadcast('updatedShoppingCart');


  };
  $scope.removeFromCart = function(pet){
  	ShoppingCart.removeFromCart(pet);
	$rootScope.$broadcast('updatedShoppingCart');
  };
  
});