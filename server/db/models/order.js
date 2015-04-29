'use strict';
var mongoose = require('mongoose'),
      Schema = mongoose.Schema;

var schema = new mongoose.Schema({
    status: String,
    date: Date,
    itemList: [{
	    item: {type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true},
	    quantity: Number,
	    price: Number

	}],
  promo: {type: mongoose.Schema.Types.ObjectId, ref: 'Promo'},
    billingAddress:
	    {firstName: String,
	    lastName:String,
	    Company:String,
	    Address:String,
	    Address2:String,
	    City:String,
	    ZIP:String,
	    Country:String,
	    State:String,
	    Phone:String }
});

module.exports = mongoose.model('Order',
 schema);