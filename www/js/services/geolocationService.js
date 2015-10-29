angular.module('starter').factory('GeolocationService',
  function($ionicPlatform, $cordovaGeolocation) {

    var positionOptions = {
      timeout: 3000,
      enableHighAccuracy: true
    };

    return {
      getPosition: function() {
        return $ionicPlatform.ready()
          .then(function() {
            return $cordovaGeolocation.watchPosition(positionOptions);
          })
      }
    };


  });
