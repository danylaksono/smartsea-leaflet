angular.module('starter').controller('gantiAvaController',
  [ '$scope',
    '$state',
    '$stateParams',
    'sessionService',
    '$cordovaCamera',
   function($scope, $state, $stateParams, sessionService, $cordovaCamera) {
   	var data = sessionService.get('currentSession');
   	$scope.ava = data.currentAva;

   	var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      targetWidth: 100,
      targetHeight: 100,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
	  correctOrientation:true
    };

	$scope.pilihFoto = function() {
		$cordovaCamera.getPicture(options).then(function(imageData) {
		    var image = document.getElementById('myImage');
		    image.src = "data:image/jpeg;base64," + imageData;
		    console.log(image.src);
			}, function(err) {
			// error
		});
	}
}])