'use strict';
var mongoose = require('mongoose'),
      Schema = mongoose.Schema;

var schema = new mongoose.Schema({
    status: String,
    date: Date,
    itemList: [{ type: Schema.ObjectId, ref: 'orderItem' }],
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