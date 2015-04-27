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

	if (!$scope.categories) AdminFactory.getCategories()
		.then(function(categories){
		
		$scope.categories = categories;

		AnimalsFactory.getAnimalCategoriesMapping($stateParams.animalID)
		.then(function(animal_categories){

			$scope.animal_categories = animal_categories;

			for (var i = 0; i < $scope.categories.length; i++) {

				$scope.categories[i].matches = [];
				for (var z = 0; z < $scope.categories[i].values.length; z++) {
					$scope.categories[i].matches.push(false);
				}

				for (var j = 0; j < $scope.animal_categories.length; j++) {

					if ($scope.categories[i]._id === $scope.animal_categories[j].categoryID) {
					// means they are both the same category. We must match de values.
					for (var k = 0; k < $scope.categories[i].values.length; k++) {

						if ( $scope.animal_categories[j].values.indexOf($scope.categories[i].values[k])>=0 ) 
							$scope.categories[i].matches[k] = true;

						}
					}
				}
			}
		});
	});


	//SCOPE METHODS
	$scope.updateCategories = function() {

		var animal_category = { animalID : $stateParams.animalID, categoryArr: [] };
		
		for (var i = 0; i < $scope.categories.length; i++) {
		
			var obj = {}
			obj.categoryID = $scope.categories[i]._id;
			obj.values = [];

			for (var j = 0; j < $scope.categories[i].values.length; j++) {
				
				if ($scope.categories[i].matches[j]) { 
					
					obj.values.push( $scope.categories[i].values[j] );
					
					//console.log("INSIDE FOR LOOP", animal_category.values);
					//console.log("INSIDE FOR LOOP", animal_category);
				}
			}

			animal_category.categoryArr.push( obj );
		}

		//Now we have to make and update (or a post if $scope.animal_categories es [])

		console.log("1");

		if ($scope.animal_categories.length === 0) { console.log("2");
		AnimalsFactory.createAnimalCategoryMapping( animal_category )
		.then( function (animal_category)
			{
				console.log("UPDATED!");
			});}
		else AnimalsFactory.updateAnimalCategoryMapping( animal_category )
		.then( function (animal_category)
			{
				console.log("UPDATED!");
			});
	}

});