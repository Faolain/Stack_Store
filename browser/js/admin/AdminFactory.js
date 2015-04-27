app.factory('AdminFactory', function ($http) {

    return {

        getUsers: function () {

            return $http.get('/api/users').then(function (response) {
                //console.log(response.data);
                return response.data;
            });

        },
        changePassword: function ( id, new_Password ) {
               
            return $http.put( '/api/users/'+id+"/changeUserPassword", 
                { password: new_Password } )
            .then(function (response) {
                return response.data;
            });

        },
        promoteToAdmin: function ( id ) {

            return $http.put( '/api/users/'+id+"/promoteUser" )
            .then(function (response) {
                return response.data;
            });

        },
        getCategories: function () {

            return $http.get('/api/categories').then(function (response) {
                return response.data;
            });

        },
        createCategory: function ( category ) {

            return $http.post('/api/categories', category ).then(function (response) {
                return response.data;
            });

        },
        deleteCategory: function ( category ) {

            return $http.delete('/api/categories/'+category._id ).then(function (response) {
                return response.data;
            });

        },
        updateCategory: function ( category ) {

            return $http.put('/api/categories/'+category._id, category ).then(function (response) {
                return response.data;
            });

        }

    };

});