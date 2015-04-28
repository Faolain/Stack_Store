var router = require('express').Router();
var deepPopulate = require('mongoose-deep-populate');
var Animals = require('../../../db/models/animal.js');
var Animal_Category = require('../../../db/models/animal_category.js');
var Reviews = require('../../../db/models/review.js');

module.exports = router;

var ensureAdmin = function (req, res, next) {
   if (req.user.admin) {
       next();
   } else {
       res.status(403).end();
   }
};

//get available animals and also filters by name for the search
router.get('/', function (req, res, next) {
  
  var obj = {};
  if (req.user && !req.user.admin) {
       obj.stock = {$gt: 0};
   }

  if (req.query.search) obj.name = req.query.search;
  Animals.find(obj, function(err, animals) {
    if (err) return next(err);
    res.send(animals);
  });
});

//get one animal by id
router.get('/:id', function (req, res, next) {
  
  var id = req.params.id;
  Animals.findById(id, function (err, animal){
      if (err) return next(err);

      animal.deepPopulate('reviews.user', function(err, animalPopulated){
        res.send(animalPopulated);
    });
  });
});

router.post('/', ensureAdmin, function (req, res, next) {
  
  Animals.create(req.body, function (err, animal) {
    if (err) return next(err);
    res.send(animal);
  });
});

//Edit Animal
router.put('/:id', ensureAdmin, function (req, res, next) {

  Animals.findByIdAndUpdate(req.params.id, req.body, function(err, animal){
     if (err) return next(err);
     res.send(animal);
   });
});


//Sends Array of Entire List of Animals
router.post('/:id/addReview', function (req, res, next) {

  var review = new Reviews(
    {
      content: req.body.content,
      user: req.session.passport.user,
      date: new Date(),
      animal: req.params.id
    });

  review.save(function (err, review) {
    if (err) return next(err);
    else {
      res.send(review);
    }
  });
});

