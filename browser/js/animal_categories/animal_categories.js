'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('animal_categories', {
        url: '/animal/:animalID/categories',
        controller: "AnimalCategoriesController",
        templateUrl: 'js/animal_categories/animal_categories.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('AnimalCategoriesController', function ($scope, $stateParams, AnimalsFactory, AdminFactory) {

	if (!$scope.animal_categories) AnimalsFactory.getAnimalByID($stateParams.animalID)
		.then(function(animal){
		
		$scope.animal_categories = animal.categories;

		AdminFactory.getCategories().then(function(categories){
		
			$scope.categories = categories;

			for (var i = 0; i < $scope.categories.length; i++) {

				$scope.categories[i].matches = [];
				for (var j = 0; j < $scope.categories[i].values.length; j++) {
					$scope.categories[i].matches.push(false);
				}
		
				for (var k = 0; k < $scope.categories[i].values.length; k++) {

					if ( $scope.animal_categories.indexOf($scope.categories[i].values[k])>=0 ) 
						$scope.categories[i].matches[k] = true;
				}

			}
		});
	});


	//SCOPE METHODS
	$scope.updateCategories = function() {

		var newCategories = [];

		for (var i = 0; i < $scope.categories.length; i++) {
		
			for (var j = 0; j < $scope.categories[i].values.length; j++) {
				
				if ($scope.categories[i].matches[j]) { 
					
					newCategories.push( $scope.categories[i].values[j] );
				}
			}

		}

		console.log( newCategories );
 
		AnimalsFactory.updateAnimal( {_id : $stateParams.animalID, categories : newCategories} )
		.then( function (animal)
			{
				console.log("UPDATED!");
			});
		
	}

});