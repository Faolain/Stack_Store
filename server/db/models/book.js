'use strict';
var mongoose = require('mongoose');
var User = require('./user.js');

var schema = new mongoose.Schema({
    title: String,
    author: String,
    ISBN: String,
    yearPublished: Number,
    Publisher: String,
    Language: String,
    category: String,
    genre: String,
    seller: User,
    price: Number

});


mongoose.model('Book', schema);