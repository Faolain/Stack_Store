app.filter('orderStatusFilter', function(){
	return function(orders, currentStatus){
		if(!currentStatus) return orders;
		if(orders){
			orders = orders.filter(function(order){
			if(order.status === currentStatus)
				return order;
		});
		return orders;
		}
		
			
	};
});