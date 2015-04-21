var router = require('express').Router();
var Animals = require('../../../db/models/animal.js');
module.exports = router;

//Sends search by Category/Specie/Rarity etc
router.get('/', function (req, res) {

  var animalName = req.query.animalName;
  var obj = {};

  obj.name = animalName;

  Animals.find(obj, function(err, animals) {
    res.send(animals);
  });
});