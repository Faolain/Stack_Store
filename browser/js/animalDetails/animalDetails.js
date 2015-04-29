'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('details', {
        url: '/animal/:animalID',
        controller: "AnimalDetailsController",
        templateUrl: 'js/animalDetails/animalDetails.html'
    });
});
