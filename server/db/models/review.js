'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User');

var schema = new mongoose.Schema({
    content: String,
    date: Date,
    user: { type: mongoose.Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('review', schema);