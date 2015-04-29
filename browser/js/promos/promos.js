'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('promos', {
        url: '/promos/:code',
        controller: "PromosController",
        templateUrl: 'js/promos/promos.html'
    });
});


app.controller('PromosController', function ($scope, $stateParams, PromosFactory) {

  $scope.error = {};

  if (!$scope.promos)
    PromosFactory.getAllPromos().then(function(promos){
    $scope.promos = promos;
  });

  $scope.createNewPromo = function(data){

    var newPromo = {
      name: data.promoName,
      discount: data.promoDiscount,
      createdDate : new Date(),
      expirationDate : data.expirationDate,
      validCategories: data.validCategories.split(/[\n,]+/).map(Function.prototype.call, String.prototype.trim)
    };


    PromosFactory.createPromo(newPromo).then(function(promo){
        $scope.promos.push(promo);
        $scope.data.createPromo = false;
        $scope.data.promoName = "";
        $scope.data.promoDiscount = "";
        $scope.data.expirationDate = "";
        $scope.data.validCategories = "";
    });
  };

  $scope.deletePromo = function(promo){
    PromosFactory.deletePromo(promo).then(function(promos){
      $scope.promos = promos;
    });
  };

  $scope.promoValidate = function(data){
    // if(!data.validCategories){
    //   $scope.error.category = "Please input a category";
    //   return false;
    // }
    // if(!data.validCategories){
    //   $scope.error.category = "Please input a category";
    //   return false;
    // }
    // if(!data.promoName || data.promoDiscount > 100)
    //   $scope.error = "Invalid Input please enter a promotional code name and a discount number below 100";
  };

});