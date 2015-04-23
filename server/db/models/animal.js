'use strict';
var mongoose = require('mongoose');
var User = mongoose.model('User');
var review = mongoose.model('review');

var schema = new mongoose.Schema({
    name: String,
    specie: String,
    rarity: String,
    reviews: [{ type: mongoose.Schema.ObjectId, ref: 'review' }],
    height: Number,
    weight: Number,
    price: Number,
    imgUrl: String,
    stock: Number,
    tags: [String],
    discontinued: Boolean
});

module.exports = mongoose.model('Animal', schema);