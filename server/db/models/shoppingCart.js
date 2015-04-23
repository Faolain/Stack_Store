'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    items: [{
	    item: {type: mongoose.Schema.Types.ObjectId, ref: 'Animal'},
	    quantity: Number,
	    price: Number

	}]

});

//create method that checks to see if item exists in shopping cart
// schema.methods = {
// 	modifyObject: function (){
// 		console.log(this)
// 	}
// }

module.exports = mongoose.model('ShoppingCart', schema);