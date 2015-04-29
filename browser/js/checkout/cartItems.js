app.directive('cartItems',function(){
	return {
		templateUrl: '/js/checkout/cartItem.tmpl.html',
		restrict: 'E',
		scope: {
			item: '='
		}
	};
});