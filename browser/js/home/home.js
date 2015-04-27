'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        controller: "HomePageController",
        templateUrl: 'js/home/home.html'
    });
});

app.controller('HomePageController', function ($scope, $stateParams, AuthService, AnimalsFactory) {   

	AnimalsFactory.getAllAnimals( /*$stateParams.category*/ ).then(function(pets){
		$scope.pets = pets;
	});

});