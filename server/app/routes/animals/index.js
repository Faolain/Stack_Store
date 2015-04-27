var router = require('express').Router();
var deepPopulate = require('mongoose-deep-populate');
var Animals = require('../../../db/models/animal.js');
var Animal_Category = require('../../../db/models/animal_category.js');
var Reviews = require('../../../db/models/review.js');
var Promise = require('bluebird');
var Animal_Category = Promise.promisifyAll(Animal_Category);

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
    else {console.log('succes',review);
    res.send(review);}
  });
});


//get categories of one particular animal
router.get('/:id/categories', function (req, res, next) {
  
  var id = req.params.id;
  Animal_Category.find({animalID : id}, function (err, animal_categories){
      if (err) return next(err);
      res.send(animal_categories);
    });
});

//create categories mapping of one particular animal
router.post('/:id/categories', function (req, res, next) {
  
  var id = req.params.id;
  var catArr = req.body.categoryArr;
  var array_of_a_c = [];

  for (var i = 0; i<catArr.length; i++) {
    var a_c = { animalID: id };
    a_c.categoryID = catArr[i].categoryID;
    a_c.values = catArr[i].values;
    array_of_a_c.push(a_c);
  }

  Animal_Category.create( array_of_a_c, function (err, animal_categories){
      if (err) return next(err);
      res.send(animal_categories);
    });
});

//update categories mapping of one particular animal
router.put('/:id/categories', function (req, res, next) {
  
  var id = req.params.id;
  var catArr = req.body.categoryArr;
  var array_of_a_c = [];

  for (var i = 0; i<catArr.length; i++) {
    var a_c = { animalID: id };
    a_c.categoryID = catArr[i].categoryID;
    a_c.values = catArr[i].values;
    array_of_a_c.push(a_c);
  }

  Promise.each(array_of_a_c, function( element ){
  return Animal_Category.findOneAsync(
    {'animalID': element.animalID, 'categoryID': element.categoryID })
      .then(function(animal_cat){
         animal_cat.values = element.values;
         animal_cat.save();
      });
  }).then( function(results) {
    res.send(results);
  } );
      
  
});

