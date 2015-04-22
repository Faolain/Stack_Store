'use strict';
var mongoose = require('mongoose');
var Animal = mongoose.model('Animal');

var schema = new mongoose.Schema({
    item: {type: mongoose.Schema.ObjectId, ref: 'Animal'},
    quantity: Number,
    price: Number

});

module.exports = mongoose.model('ShoppingCartItem', schema);

