'use strict';
var mongoose = require('mongoose');
var ShoppingCartItem = mongoose.model('ShoppingCartItem');

var schema = new mongoose.Schema({
    items: [ShoppingCartItem],

});

module.exports = mongoose.model('ShoppingCart', schema);