app.directive('orderTableRow',function(){
	return {
		templateUrl:'js/orderAdmin/OrderAdminTableRow.tmp.html',
		restrict: 'EA',
		scope: {order:'='}
	};
});

