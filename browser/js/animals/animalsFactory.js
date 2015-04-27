app.factory('AnimalsFactory', function ($http) {

    return {

        getAllAnimals: function (searchText) {

            var queryParams = {};

            if (searchText) {
                queryParams.searchText = searchText;
            }

            return $http.get('/api/animals', {
                params: queryParams
            }).then(function (response) {
                return response.data;
            });
            
        }, getAnimalByID: function (id, populated) {

            return $http.get('/api/animals/'+id ).then(function (response) {
                return response.data;
            });

        },

        createAnimal: function ( animal ) {

            return $http.post('/api/animals', animal ).then(function (response) {
                return response.data;
            });

        },

        updateAnimal: function ( animal ) {

            return $http.put('/api/animals/'+animal._id, animal ).then(function (response) {
                return response.data;
            });

        },

        createReview: function ( content, id ) {

            return $http.post( '/api/animals/'+id+"/addReview", { content: content } )
            .then(function (response) {
                return response.data;
            });

        },
        
        getAnimalCategoriesMapping: function ( id ) {

            return $http.get('/api/animals/'+id+'/categories').then(function (response) {
                return response.data;
            });

        },

        createAnimalCategoryMapping: function ( animal_category ) {

            return $http.post( '/api/animals/'+animal_category.animalID+'/categories', { 
                categoryArr: animal_category.categoryArr } )
            .then(function (response) {
                return response.data;
            });
            
        },

        updateAnimalCategoryMapping: function ( animal_category ) {

            return $http.put( '/api/animals/'+animal_category.animalID+"/categories", { 
                categoryArr: animal_category.categoryArr } )
            .then(function (response) {
                return response.data;
            });

        }
    };

});