'use strict';
var mongoose = require('mongoose');
var User = mongoose.model('User');

var schema = new mongoose.Schema({
    title: String,
    author: String,
    ISBN: String,
    yearPublished: Number,
    Publisher: String,
    Language: String,
    category: String,
    genre: String,
    price: Number

});

module.exports = mongoose.model('Book', schema);