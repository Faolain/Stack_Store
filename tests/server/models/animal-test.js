var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var sinon = require('sinon');
var expect = require('chai').expect;
var mongoose = require('mongoose');

require('../../../server/db/models/user');
require('../../../server/db/models/animal');
require('../../../server/db/models/review');

var User = mongoose.model('User');
var Animal = mongoose.model('Animal');
var review = mongoose.model('review');

describe('Animal model', function () {

   beforeEach('Establish DB connection', function (done) {
        if (mongoose.connection.db) return done();
        mongoose.connect(dbURI, done);
    });

    afterEach('Clear test database', function (done) {
        clearDB(done);
    });

describe('on creation', function () {
 var a;

  beforeEach('Crear Animal antes de testear', function (done) {
    var createAnimal = function () {
      return Animal.create({ name: 'Monster', 
        description: 'This is the craziest monster', price: 783,
        specie: 'Ghost'});
      };

      createAnimal().then(function (animalDB) {
        a = animalDB;
        done();
      }, function (err) {
        console.error(err);
        done(err);
      });
    });

            it('should have a title, a description and a price', function (done) {
                      expect(a.name).to.equal("Monster");
                      expect(a.description).to.equal("This is the craziest monster");
                      expect(a.price).to.equal(783);
                    done();
            });

            it('should belong at list to a category', function (done) {
                    expect(a.specie).to.not.equal(null);
                    done();
            });

             it('sIf there is no photo, there must be a placeholder photo used', function (done) {
                    expect(a.imgUrl).to.equal("http://www.placecage.com/c/200/300");
                    done();
            });


        });
});