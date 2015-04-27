'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('animals', {
        url: '/animals',
        controller: "AnimalsController",
        templateUrl: 'js/animals/animals.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});


app.controller('AnimalsController', function ($scope, $stateParams, AnimalsFactory) {

	if (!$scope.animals) AnimalsFactory.getAllAnimals().then(function(animals){
		$scope.animals = animals;
	});

	
	$scope.data = {
        newName: "",
        newDescription: "",
        newPrice: "",
        newStock: "",
        createAnimal: false
    }; 

	// //SCOPE METHODS

	$scope.createNewAnimal = function( data ) {
		
		var newAnimal = { 
			name: data.newName,
			description: data.newDescription,
			price: data.newPrice,
			stock: data.newStock
		}

		AnimalsFactory.createAnimal( newAnimal )
		.then( function (animal)
			{
				console.log("ADDED!");
				$scope.animals.push(animal);
				$scope.data.createAnimal = false;

				$scope.data.newName = "";
        		$scope.data.newDescription = "";
        		$scope.data.newPrice = "";
        		$scope.data.newStock = "";
			});
	}

	$scope.updateAnimal = function( animal ) {
		
		animal.beingEdited = undefined;

		AnimalsFactory.updateAnimal( animal )
		.then( function (animal)
			{
				console.log("UPDATED!");
			});
	}

	$scope.edit = function( animal ) {
		animal.beingEdited = true;
		animal.oldName = animal.name;
		animal.oldDesc = animal.description;
		animal.oldPrice = animal.price;
		animal.oldStock = animal.stock;
	}

	$scope.reset = function( animal ) {
		animal.beingEdited = false;
		animal.name = animal.oldName;
		animal.description = animal.oldDesc;
		animal.price = animal.oldPrice;
		animal.stock = animal.oldStock;
		animal.oldName = undefined;
		animal.oldDesc = undefined;
		animal.oldPrice = undefined;
		animal.oldStock = undefined;
	}

});