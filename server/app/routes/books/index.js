var router = require('express').Router();
var Books = require('../../../db/models/book.js');
module.exports = router;

//Sends Array of Entire List of Products(Books)
router.get('/', function (req, res) {
  Books.find({}, function(err, books) {
    res.send(books);
  });
});


//Sends Particular ID
router.get('/book/:id', function (req, res) {
  var id = req.params.id;

  Books.findById(id, function (err, book){
    res.send(book);
  });
});

//Sends search by Genre & Book Name
router.get('/search/:genreName/:radioType/:searchText', function (req, res) {
  var genreName = req.params.genreName;
  var searchText = req.params.searchText;
  var radioType = req.params.radioType;

  var obj = {};
  if (genreName !== "All") obj.genre = genreName;
  if (radioType === "Author") obj.author =  searchText;
  if (radioType === "Title") obj.title =  searchText;
  if (radioType === "ISBN") obj.ISBN =  searchText;

  Books.find(obj, function(err, books) {
    res.send(books);
  });
});

