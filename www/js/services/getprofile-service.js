angular.module('starter')
.factory('getProfileService', function(sessionService) {
	var ref = new Firebase("https://smartseadevelop.firebaseio.com/users");
	return{
		get: function(uid) {
			console.log('getting uid : ', uid)
			var uid = uid;
			ref.on("value", function(snapshot) {
				var data = snapshot.val()[uid];
				data.isLogin = true;
				data.uid = uid;
			  	sessionService.set('currentSession', data);
			}, function (errorObject) {
			  	console.log(errorObject.code);
			});
		}
	}
})
