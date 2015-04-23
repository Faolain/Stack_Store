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
	console.log("animalId",review.animal);
	Animal.findById(review.animal, function (err, animal){
		  if(err) console.error(err);
		  else if(animal){
		  	console.log('animal found',review);
		  	animal.reviews.push(review._id);
          	animal.save();

		  }
		  else{
		  	return console.error('animal not found');
		  }
          
        });
});

module.exports = mongoose.model('review', schema);