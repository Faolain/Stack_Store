'use strict';
app.config(function ($stateProvider) {
    $stateProvider.state('order_details', {
        url: '/order/:orderID',
        controller: "OrderDetailsController",
        templateUrl: 'js/orderDetails/orderDetails.html'
    });
});

