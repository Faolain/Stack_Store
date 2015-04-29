var router = require('express').Router();
var Promos = require('../../../db/models/promo.js');

module.exports = router;

var ensureAdmin = function (req, res, next) {
   if (req.user.admin) {
       next();
   } else {
       res.status(403).end();
   }
};

var ensureAuthenticated = function (req, res, next) {
   if (req.isAuthenticated()) {
       next();
   } else {
       res.status(401).end();
   }
};

//get available animals and also filters by name for the search
router.get('/', ensureAuthenticated, function (req, res, next) {
  Promos.find({}, function(err, promos) {
    if (err) return next(err);
    res.send(promos);
  });
});

//get available animals and also filters by name for the search
router.get('/:code', function (req, res, next) {
  var obj = {};
  if(req.params.code){
    obj.name = req.params.code;
  }

  Promos.find(obj, function(err, promos) {
    // if (err) return next(err);
    if(err){
      res.send({error: "No promos found"});
    } else {
      res.send(promos);
    }


  });
});

router.post('/', ensureAdmin, function (req, res, next) {
  Promos.create(req.body.promo, function (err, promo) {
    if (err) return next(err);
    res.send(promo);
  });
});

//get available animals and also filters by name for the search
router.delete('/:id', ensureAdmin, function (req, res, next) {
  Promos.findByIdAndRemove(req.params.id, function(err, promo) {
    if (err) return next(err);
      Promos.find({}, function(err, promos) {
      if (err) return next(err);
      res.send(promos);
    });
  });
});

