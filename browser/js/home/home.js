'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        controller: "HomePageController",
        templateUrl: 'js/home/home.html'
    });
});

app.filter('categoryFilter', function () {
	function intersect(a, b) {
		var t;
	   	if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
	   	return a.filter(function (e) {
	   		if (b.indexOf(e) !== -1) return true;
	   	});
	}

  return function ( pets, categories ) {
    var filtered = [];
    for (var i = 0; i < pets.length; i++) {
      var pet = pets[i];
      if (intersect(pet.categories, categories).length === categories.length) {
        filtered.push(pet);
      }
    }
    return filtered;
  };
});

app.controller('HomePageController', function ($scope, $stateParams, AdminFactory, AnimalsFactory) {   
	$scope.filters = [];
	$scope.pets = [];
	$scope.searchField = { text: "" };

	if (!$scope.categories) AdminFactory.getCategories()
		.then(function(categories){
		$scope.categories = categories;

		for (var i = 0; i < $scope.categories.length; i++) {
				$scope.categories[i].matches = [];
				for (var z = 0; z < $scope.categories[i].values.length; z++) {
					$scope.categories[i].matches.push(false);
				}
		}
	});

	AnimalsFactory.getAllAnimals( /*$stateParams.category*/ ).then(function(pets){
		$scope.pets = pets;
	});


	//SCOPE METHODS
	$scope.filter = function() {
		
		$scope.filters = [];
		
		for (var i = 0; i < $scope.categories.length; i++) {

			for (var j = 0; j < $scope.categories[i].values.length; j++) {
				if ($scope.categories[i].matches[j]) { 
					$scope.filters.push( $scope.categories[i].values[j] );
				}
			}
		}
		
	};

	$scope.searchBy = function() {

		if (!$scope.searchField.text || $scope.searchField.text==="") 
			AnimalsFactory.getAllAnimals().then(function(pets){
		$scope.pets = pets;
		});
		
		else AnimalsFactory.getAllAnimals( $scope.searchField.text ).then(function(pets){
		$scope.pets = pets;
	});
		
	};
});