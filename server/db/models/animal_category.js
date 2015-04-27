'use strict';
var mongoose = require('mongoose'),
	Animal = mongoose.model('Animal'),
	Category = mongoose.model('Category');

var schema = new mongoose.Schema({
    animalID: { type: mongoose.Schema.ObjectId, ref: 'Animal', required: true },
    categoryID: { type: mongoose.Schema.ObjectId, ref: 'Category', required: true },
    values: [{type: String}]
});


module.exports = mongoose.model('Animal_Category', schema);