'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('order_details', {
        url: '/order/:orderID',
        templateUrl: 'js/orderDetails/orderDetails.html'
    });
});

