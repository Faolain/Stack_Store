'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        controller: "PetStoreFrontController",
        templateUrl: 'js/home/home.html'
    });
});