app.directive('shoppingCart',function(){
	return {
		restrict:'E',
		controller: 'ShoppingCartController',
		templateUrl: 'js/shoppingCart/ShoppingCart.tmp.html'

	};
});