angular.module('starter')
.factory('sessionService', function($window) {
	return {
		set: function(key, val) {
			$window.localStorage.setItem(key, JSON.stringify(val))
		},
		get: function(key) {
			return JSON.parse($window.localStorage.getItem(key));			
		},
		isLogin: function() {
			return JSON.parse($window.localStorage.getItem('currentSession')).isLogin;
		},
		remove: function(key) {
			$window.localStorage.removeItem(key);
		}
	}
})