'use strict';
var mongoose = require('mongoose');


var schema = new mongoose.Schema({
    items: [{
	    item: {type: mongoose.Schema.Types.ObjectId, ref: 'Animal'},
	    quantity: Number,
	    price: Number

	}]

});

schema.static('updateShoppingCart', function(cartItems,cartId, callback){
	cartItems = cartItems.map(function(item){
		return {item: item._id, quantity: item.quantity,price:item.price};
	});
	this.findById(cartId,function(err,cart){
		if(err) console.error('find cart error',err);
		else if(cart){
			cart.items = cartItems;
			cart.save(callback);
		}
	});
});

module.exports = mongoose.model('ShoppingCart', schema);