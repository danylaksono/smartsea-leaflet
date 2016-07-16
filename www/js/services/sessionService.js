angular.module('starter')
.factory('sessionService', function($window, $timeout, $rootScope) {
	angular.element($window).on('storage', function(event) {
    if (event.key === 'currentSession') {
      $rootScope.$apply();
    }
  });
	return {
		set: function(key, val) {
			$window.localStorage && $window.localStorage.setItem(key, JSON.stringify(val))
		},
		get: function(key) {
			return $window.localStorage && JSON.parse($window.localStorage.getItem(key));
		},
		isLogin: function() {
			var currentSession = $window.localStorage.getItem('currentSession');
			if (currentSession) {
				return $window.localStorage && JSON.parse($window.localStorage.getItem('currentSession')).isLogin;
			}
			/*
			var currentSession = $window.localStorage.getItem('currentSession');
			if (currentSession) {
					var checkLogin = JSON.parse(currentSession).isLogin;
					console.log(checkLogin);
					$timeout(function(){
		    		$rootScope.$broadcast("loginstate", checkLogin);
					});
					return checkLogin;
			}
			*/
		},
		remove: function(key) {
			$window.localStorage.removeItem(key);
		}

	}
})
