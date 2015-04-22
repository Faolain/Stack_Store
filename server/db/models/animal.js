'use strict';
var mongoose = require('mongoose');
var User = mongoose.model('User');

var schema = new mongoose.Schema({
    name: String,
    specie: String,
    rarity: String,
    reviews: [String],
    height: Number,
    weight: Number,
    price: Number,
    imgUrl: String,
    stock: Number,
    tags: [String],
    discontinued: Boolean
});

module.exports = mongoose.model('Animal', schema);