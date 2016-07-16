angular.module('starter')
.factory('broadcastService', function($rootScope) {
	return {
        send: function(msg, data) {
            $rootScope.$broadcast(msg, data);
        }
    }
})
