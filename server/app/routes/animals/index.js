var router = require('express').Router();
var Animals = require('../../../db/models/animal.js');
var Reviews = require('../../../db/models/review.js');
module.exports = router;

//Sends Particular Animal ID
router.get('/:id', function (req, res) {
  var id = req.params.id;

  Animals.findById(id, function (err, animal){
    res.send(animal);
  });
});

//Sends Array of Entire List of Animals
router.get('/', function (req, res) {
  Animals.find({discontinued: false}, function(err, animals) {
    res.send(animals);
  });
});

//Sends Array of Entire List of Animals
router.post('/addReview/:id', function (req, res, next) {

  var reviewObj = {};
  reviewObj.content = req.body.content;
  // reviewObj.user = req.session.user._id;
  reviewObj.date = new Date();

  Reviews.create(reviewObj, function (err, review) {
    if (err) return next(err);
    // saved!
    Animals.findById(req.params.id, function (err, animal){
      animal.reviews.push(review._id);
      animal.save( function(err, savedAnimal) {
        res.send(savedAnimal);
      });
    });

  });
});




