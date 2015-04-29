app.factory('PromosFactory', function ($http) {
    return {
        getAllPromos: function () {
            return $http.get('/api/promos').then(function (response) {
                return response.data;
            });
        },

        createPromo: function (promo) {
            return $http.post('/api/promos', {promo: promo}).then(function (response) {
                return response.data;
            });
        },

        deletePromo: function (promo) {
            return $http.delete('/api/promos/'+promo._id ).then(function (response) {
                return response.data;
            });
        }
    };

});