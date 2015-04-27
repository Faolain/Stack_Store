'use strict';
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');
var User = mongoose.model('User');

var schema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    specie: String,
    description: {type: String, required: true},
    reviews: [{ type: mongoose.Schema.ObjectId, ref: 'review' }],
    height: Number,
    weight: Number,
    price: {type: Number, required: true},
    imgUrl: {type: String, default: "http://www.placecage.com/c/200/300"},
    secondaryImgUrls: [{type: String}],
    stock: {type: Number, default: 0},
    tags: [String],
    discontinued: Boolean
});

schema.plugin(deepPopulate);

module.exports = mongoose.model('Animal', schema);