var router = require('express').Router();
var Animals = require('../../../db/models/animal.js');
var Reviews = require('../../../db/models/review.js');
module.exports = router;

var ensureAdmin = function (req, res, next) {
   if (req.user.admin) {
       next();
   } else {
       res.status(403).end();
   }
};



//get one animal by id
router.get('/:id', function (req, res) {
  var id = req.params.id;

  Animals.findById(id, function (err, animal){
    res.send(animal);
  });
});

//get available animals and also filters by name for the search
router.get('/', function (req, res) {
  var obj = {};
  if (!req.user.admin) obj.discontinued = false;
  if (req.query.search) obj.name = req.query.search;
  Animals.find(obj, function(err, animals) {
    res.send(animals);
  });
});

//Create Animal
router.post('/', ensureAdmin, function (req, res, next) {
  console.log('check the user',req.user);

  Animals.create(req.body, function (err, animal) {
    if (err) return next(err);
    // saved!
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
router.post('/:id/addReview', ensureAdmin, function (req, res, next) {

  var reviewObj = {};
  reviewObj.content = req.body.content;
  reviewObj.user = req.session.passport.user;
  reviewObj.date = new Date();

  Reviews.create(reviewObj, function (err, review) {
    if (err) return next(err);
    
    Animals.findById(req.params.id, function (err, animal){
      animal.reviews.push(review._id);
      animal.save( function(err, savedAnimal) {
        res.send(savedAnimal);
      });
    });

  });
});




