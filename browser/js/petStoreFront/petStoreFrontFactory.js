app.factory('PetStoreFrontFactory', function ($http) {
//Factory es un singleton.
// var flash = []; 
// El codigo antes del return se ejecuta una primera vez la primera vez que se inyecta.

    return {

        getPets: function (searchText) {

            var queryParams = {};

            if (searchText) {
                queryParams.searchText = searchText;
            }

            return $http.get('/api/animals', {
                params: queryParams
            }).then(function (response) {
                console.log(response.data);
                return response.data;
            });

        }, getPetByID: function (id) {

            return $http.get('/api/animals/'+id).then(function (response) {
                console.log(response.data);
                return response.data;
            });

        }
// ,
//         postFlashCards: function(card) {

//              return $http.post('/cards', card
//             ).then(function (response) {
//                 return response.data;
//             });

//         }

    };

});