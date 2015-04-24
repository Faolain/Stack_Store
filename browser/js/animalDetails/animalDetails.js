'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('details', {
        url: '/animal/:animalID',
        controller: "PetStoreFrontController",
        templateUrl: 'js/animalDetails/animalDetails.html'
    });
});