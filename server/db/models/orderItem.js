'use strict';
var mongoose = require('mongoose'),
    Animal = mongoose.model('Animal');

var schema = new mongoose.Schema({
    price: Number,
    quantity: Number,
    itemId: { type: mongoose.Schema.ObjectId, ref: 'Animal' }
});

module.exports = mongoose.model('orderItem', schema);