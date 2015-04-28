app.factory('OrdersAdminFactory',function($http){
	return {
		getAllOrders: function(){
			return $http.get('/api/orders').then(function(response){
				return response.data;
			});
		}, 
		getOrderByID: function(id){
			return $http.get('/api/orders/'+id).then(function(response){
				return response.data;
			});

		},
		changeUserStatus: function(orderId, newStatus){

			return $http.put('/api/orders/'+orderId,{status: newStatus}).then(function(response){
				return response.data;
			});
		}


	};
});