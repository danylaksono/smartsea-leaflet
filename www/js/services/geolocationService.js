angular.module('starter').factory('GeolocationService',
function($ionicPlatform, $cordovaGeolocation, $q) {

  var latLong = null;
  var watchOptions = {
    timeout: 10000,
    enableHighAccuracy: true // may cause errors if true
  };

  var getLatLong = function(refresh) {
    var deferred = $q.defer();
    if (latLong === null || refresh) {
      console.log('Getting lat long');
      $cordovaGeolocation.watchPosition(watchOptions).then(
        null,
        function(err) {
          console.log(err);
          latLong = null
          deferred.reject('Failed to Get Lat Long')
        },
        function(position) {
          latLong = {
            'lat': position.coords.latitude,
            'long': position.coords.longitude
          }
          deferred.resolve(latLong);
        });
    } else {
      deferred.resolve(latLong);
    }
    return deferred.promise;
  };

  return {
    getLatLong: getLatLong
  }

});
