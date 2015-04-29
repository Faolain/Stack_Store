var router = require('express').Router();
var mongoose = require('mongoose');
var Category = require('../../../db/models/category.js');

var ensureAdmin = function (req, res, next) {
   if (req.user.admin) {
       next();
   } else {
       res.status(403).end();
   }
};

//get all categories
router.get('/', function (req, res, next) {
  Category.find({}, function(err, categories) {
    if (err)  { 
        console.log(err);
        return next(err);
      }
    res.send(categories);
  });
});

//add category
router.post('/', ensureAdmin, function (req, res, next) {
  Category.create(req.body, function (err, category) {
    if (err) return next(err);
    res.send(category);
  });
});

//Update a Category
router.put('/:id', ensureAdmin, function (req, res, next) {
    Category.findById(req.params.id, function (err, category){
      category.name = req.body.name;
      category.values = req.body.values;
      category.save(function(err, savedCategory){
         if (err)  { 
            console.log(err);
            return next(err);
          }
         res.send(savedCategory);
      });
    });
});

//Delete category
router.delete('/:id', ensureAdmin, function (req, res, next) {
  Category.findByIdAndRemove(req.params.id, function (err, category) {
    if (err) {  console.log(err); return next(err); }
    console.log(category);
    res.send(category);
  });
  //TODO: We should delete also in the association model between categories and animals
});

module.exports = router;