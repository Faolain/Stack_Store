'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    values: [{type: String}]
});


module.exports = mongoose.model('Category', schema);