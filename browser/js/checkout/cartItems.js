app.directive('cartItems',function(){
	return {
		template: 
			'<div class="row"><img class="checkout-img" src={{item.imgUrl}}></img><p>Item Description: {{item.name}}</p><p>Item Quantity:  {{item.quantity}}</p> Item Total: {{item.quantity*item.price}}</div>',
		restrict: 'E',
		scope: {
			item: '='
		}
	};
});