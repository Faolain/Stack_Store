'use strict';
var mongoose = require('mongoose'),
Animal = mongoose.model('Animal');

var schema = new mongoose.Schema({
    content: String,
    date: Date,
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    animal: { type: mongoose.Schema.ObjectId, ref: 'Animal' }
});

schema.post('save',function(review){
	Animal.findById(review.animal, function (err, animal){
		  if(err) console.error(err);
		  else if(animal){
		  	animal.reviews.push(review._id);
          	animal.save();
		  }
		  else{
		  	return console.error('Animal not found');
		  }
          
        });
});

module.exports = mongoose.model('review', schema);