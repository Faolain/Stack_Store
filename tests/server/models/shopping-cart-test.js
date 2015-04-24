var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');


require('../../../server/db/models/shoppingCart');
var ShoppingCart = mongoose.model('ShoppingCart');
require('../../../server/db/models/animal');
var Animal = mongoose.model('Animal');



describe('Shopping Cart Model', function () {


   beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

    afterEach('Clear test database', function (done) {
        clearDB(done);
    });

describe('on Shopping Cart Create', function () {
 var retrievedCart, animalId;

  beforeEach('creating shopping cart before testing', function (done) {

     var createAnimal = function(){
      return Animal.create({
            name: "Tarantula",
            specie: "Anthropod",
            rarity: 'Abundant',
            description: "Scary",
            height: 2,
            weight: 0.1,
            price: 1,
            imgUrl: "http://static0.therichestimages.com/cdn/1077/718/90/cw/wp-content/uploads/2014/05/Pet-Tarantulas-51.jpg",
            discontinued: false
        });
    };
    createAnimal()
    .then(function(animal){
      return animal;
    })
    .then(function(animal){
        animalId = animal._id;
        return ShoppingCart.create({items: [{item:animal._id,quantity:1,price:10}]});
      })
    .then(function(cart){
        retrievedCart = cart;
        done();
      })
    .then(null, function(err){
        done(err);
      });

    });
    it('test model', function (done) {
          expect(retrievedCart.items[0].quantity).to.equal(1);
          expect(retrievedCart.items[0].price).to.equal(10);
          expect(retrievedCart.items[0].item).to.equal(animalId);
            done();
    });




  });
  describe('test validation, animal item required', function () {
   var cart;

    beforeEach(function (done) {

      cart = new ShoppingCart();
      ShoppingCart.remove({quantity: 1,price:0},done);

      });

      it('should err without item', function (done) {
            cart.validate(function(err){
              expect(err).to.exist;
              expect(err.errors).to.have.property('item');
              if (err.errors.item){
                expect(err.errors.item.message).to.equal('Path `item` is required.');

              }

            });
             done();
      });




});
  describe('update ShoppingCart with static method', function () {
 var cartId;

  beforeEach('creating shopping cart before updating', function (done) {
    var cartItems = [ { _id: '55391c3cae22f8d71569115e',
    name: 'Hyacinth Macaw',
    specie: 'Parrot',
    rarity: 'Scarce',
    height: 40,
    weight: 7,
    price: 12000,
    imgUrl: 'http://static6.therichestimages.com/cdn/1077/868/90/cw/wp-content/uploads/2014/05/bigstock-HYACINTH-MACAW-777524.jpg',
    __v: 0,
    tags: [],
    reviews: [],
    quantity: 2 },
  { _id: '55391c3cae22f8d71569115b',
    name: 'Serval',
    specie: 'Cat',
    rarity: 'Rare',
    height: 50,
    weight: 25,
    price: 2500,
    imgUrl: 'http://static5.therichestimages.com/cdn/1077/695/90/cw/wp-content/uploads/2014/05/savannah_cat-serval-cat1.jpg',
    __v: 0,
    tags: [],
    reviews: [],
    quantity: 1 },
  { _id: '55391c3cae22f8d71569115d',
    name: 'Squirrel Monkey',
    specie: 'Primate',
    rarity: 'Abundant',
    height: 35,
    weight: 12,
    price: 8000,
    imgUrl: 'http://static9.therichestimages.com/cdn/792/993/90/cw/wp-content/uploads/2014/05/squirrel-monkey-png1.jpg',
    __v: 0,
    tags: [],
    reviews: [],
    quantity: 1 } ];

     var createAnimal = function(){
      return Animal.create({
            name: "Tarantula",
            specie: "Anthropod",
            rarity: 'Abundant',
            description: "Scary",
            height: 2,
            weight: 0.1,
            price: 1,
            imgUrl: "http://static0.therichestimages.com/cdn/1077/718/90/cw/wp-content/uploads/2014/05/Pet-Tarantulas-51.jpg",
            discontinued: false
        });
    };
    createAnimal()
    .then(function(animal){
      return animal;
    })
    .then(function(animal){
        return ShoppingCart.create({items: [{item:animal._id,quantity:1,price:10}]});
      })
    .then(function(cart){
        ShoppingCart.updateShoppingCart(cartItems,cart._id,function(err,cart){
          cart.populate('items.item',function(err,cart){
            retrievedCart = cart;
            console.log('populated',cart);
            done();
          });
        });
        
      })
    .then(null, function(err){
        done(err);
      });

    });
    it('test model', function (done) {
          expect(retrievedCart.items.length).to.equal(3);
          done();
    });




  });
      

});