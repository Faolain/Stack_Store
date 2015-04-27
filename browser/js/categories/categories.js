'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('categories', {
        url: '/categories',
        controller: "CategoriesController",
        templateUrl: 'js/categories/categories.html'
        // ,
        // data: {
        //     admin: true
        // }
    });
});

app.controller('CategoriesController', function ($scope, $stateParams, AuthService, AdminFactory) {

	if (!$scope.categories) AdminFactory.getCategories().then(function(categories){
		$scope.categories = categories;
	});

	$scope.data = {
        newName: "",
        newValues: "",
        createCategory: false
    }; 


	//SCOPE METHODS
	$scope.createNewCategory = function( data ) {
		
		var newCategory = { 
			name: data.newName,
			values: data.newValues.split(/[\n,]+/).map(Function.prototype.call, String.prototype.trim)
			//TODO: if two of the values are equal it fails 
		}

		AdminFactory.createCategory( newCategory )
		.then( function (category)
			{
				$scope.categories.push(category);
				$scope.data.createCategory = false;
				$scope.data.newName = "";
        		$scope.data.newValues = "";
    
			});
	}

	$scope.updateCategory = function( category ) {
		
		category.beingEdited = undefined;
		category.values = category.newEditValues.split(/[\n,]+/).map(Function.prototype.call, String.prototype.trim)
		category.newEditValues = undefined;

		AdminFactory.updateCategory( category )
		.then( function (category)
			{
				console.log("UPDATED!");
			});
	}

	$scope.deleteCategory = function( index ) {

		AdminFactory.deleteCategory( $scope.categories[index] )
		.then( function (category)
			{
				$scope.categories.splice(index, 1);
			});
	}

	$scope.editCategory = function( category ) {
		category.beingEdited = true;
		category.newEditValues = category.values.join();
		category.oldName = category.name;
		category.oldValues = category.values;
	}

	$scope.resetCategory = function( category ) {
		category.beingEdited = false;
		category.name = category.oldName;
		category.values = category.oldValues;
		category.oldName = undefined;
		category.oldValues = undefined;
	}

	

});