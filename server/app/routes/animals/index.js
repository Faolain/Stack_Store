var router = require('express').Router();
var Animals = require('../../../db/models/animal.js');
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
  Animals.find({}, function(err, animals) {
    res.send(animals);
  });
});



