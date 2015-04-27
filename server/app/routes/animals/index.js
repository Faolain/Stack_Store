var router = require('express').Router();
var deepPopulate = require('mongoose-deep-populate');
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



// //get one animal by id
// router.get('/:id', function (req, res) {
//   var id = req.params.id;
//   Animals.findById(id, function (err, animal){
//     animal.populate('reviews', 'user', function(err, animalPopulated){
//       //console.log(animalPopulated);
//         res.send(animalPopulated);
//     });
//   });
// });

//get available animals and also filters by name for the search
router.get('/', function (req, res) {
  var obj = {};
  //if (!req.user.admin) obj.discontinued = false;
  if (req.query.search) obj.name = req.query.search;
  Animals.find({}, function(err, animals) {
    res.send(animals);
  });
});




router.post('/', ensureAdmin, function (req, res, next) {
  console.log('check the user',req.user);


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
  //create methods and statics here

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

router.delete('/:id',function(req,res,next){
  Animals.findByIdAndRemove(req.params.id, function(err,data){
        res.send(data);
        return next(err);
    });
});


