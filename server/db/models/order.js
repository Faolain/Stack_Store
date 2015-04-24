'use strict';
var mongoose = require('mongoose'),
      Schema = mongoose.Schema;

var schema = new mongoose.Schema({
    status: String,
    date: Date,
    itemList: [{ type: Schema.ObjectId, ref: 'orderItem' }]
});

module.exports = mongoose.model('Order', schema);