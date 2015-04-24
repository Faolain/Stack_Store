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
            description: "Scary",
            price: 1,
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
 var cartId, retrievedAnimals;

  beforeEach('creating shopping cart before updating', function (done) {
    var cartItems = [ 
    {
    name: 'Hyacinth Macaw',
    price: 12000,
    description: "happy"
  },
  {
    name: 'Serval',
    price: 2500,
    description: "sad"
  },
  {
    name: 'Squirrel Monkey',
    price: 8000,
    description: "YES"
    }];

     Animal.create(cartItems)
    .then(function(animal){

      return animal;
    })
    .then(function(animal){
      retrievedAnimals = animal;
        return ShoppingCart.create({items: [{item:animal[0]._id,quantity:1,price:10}]});
      })
    .then(function(cart){
        ShoppingCart.updateShoppingCart(retrievedAnimals,cart._id,function(err,cart){
           retrievedCart = cart;
          ShoppingCart.populate(cart,'items.item',function(err,cart){
            done();
          });
        });

      })
    .then(null, function(err){
        done(err);
      });

    });
    it('test model', function (done) {
          console.log('here is my cart',retrievedCart.items);
          expect(retrievedCart.items.length).to.equal(3);
          expect(retrievedCart.items[0].item.name).to.equal("Hyacinth Macaw");
          expect(retrievedCart.items[0].item.price).to.equal(12000);
          expect(retrievedCart.items[0].item.description).to.equal("happy");
          expect(retrievedCart.items[1].item.name).to.equal("Serval");
          expect(retrievedCart.items[1].item.price).to.equal(2500);
          expect(retrievedCart.items[1].item.description).to.equal("sad");

          done();
    });




  });


});

});