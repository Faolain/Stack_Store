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

//get all animals
router.get('/', function (req, res) {
  Animals.find({}, function(err, animals) {
    res.send(animals);
  });
});


//get available animals
router.get('/getStock', function (req, res) {
  Animals.find({discontinued:false}, function(err, animals) {
    res.send(animals);
  });
});

//Create Animal
router.post('/createAnimal', ensureAdmin, function (req, res, next) {


  Animals.create(req.body, function (err, animal) {
    if (err) return next(err);
    res.send(animal);
  });
});

//Edit Animal
router.put('/editAnimal/:id', ensureAdmin, function (req, res, next) {

  Animals.findByIdAndUpdate(req.params.id, req.body, function(err, animal){
     if (err) return next(err);
     res.send(animal);
   });
});


//Sends Array of Entire List of Animals
router.post('/addReview/:id', ensureAdmin, function (req, res, next) {

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




