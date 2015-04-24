var supertest = require('supertest');
var app = require('../../../server/app');
var agent = supertest.agent(app);
var expect = require('chai').expect;


// require('../../../server/db/models/user');
// require('../../../server/db/models/animal');
// require('../../../server/db/models/review');
// var User = mongoose.model('User');
// var Animal = mongoose.model('Animal');
// var review = mongoose.model('review');

describe('http requests', function() {

  // start with a bare database so we know exactly what we're testing
  // beforeEach(function(done) {
  //   Animal.remove({}, done);
  // });

  // we're going to have one doc in the db for every test
  // beforeEach(function(done) {
  //   Animal.create({
  //     title: 'Anolis carolinensis',
  //     body: 'Small dewlapping lizard native to the southeastern USA.',
  //     tags: ['lizard', 'USA']
  //   }, done);
  // });

  // make sure it gets something from the root
  describe('GET /animals', function() {
    it('should get 200 on index', function(done) {
      agent
        .get('/api/animals')
        .expect(200, done);
    });
  });

  // logging an user
  describe('POST /login', function() {
    it('should log a user', function(done) {
      agent
        .post('/login')
        .send({
          email: 'user@rr.com',
          password: '1'
        })
        .end(function(err, response) {
            //console.log("response -->", response);
            done();
        });
    });
  });

});