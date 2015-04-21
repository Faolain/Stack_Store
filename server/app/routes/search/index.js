var router = require('express').Router();
var Animals = require('../../../db/models/animal.js');
module.exports = router;

//Sends search by Category/Specie/Rarity etc
router.get('/', function (req, res) {
  console.log('HITTING SEARCH');

  var genreName = req.query.genreName;
  var searchText = req.query.searchText;
  var radioType = req.query.radioType;

  var obj = {};
  if (genreName !== "All") obj.genre = genreName;
  if (radioType === "Author") obj.author =  searchText;
  if (radioType === "Title") obj.title =  searchText;
  if (radioType === "ISBN") obj.ISBN =  searchText;

  Animals.find(obj, function(err, animals) {
    res.send(animals);
  });
});