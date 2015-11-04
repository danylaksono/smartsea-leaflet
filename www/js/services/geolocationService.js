angular.module('starter').factory('GeolocationService',
  function($ionicPlatform, $cordovaGeolocation, $q) {

    var latLong = null;
    var watchOptions = {
      timeout: 15000,
      frequency: 1000,
      enableHighAccuracy: true // may cause errors if true
    };

    var watch = $cordovaGeolocation.watchPosition(watchOptions);

    var getLatLong = function(refresh) {
      var deferred = $q.defer();
      if (latLong === null || refresh) {
        console.log('Mengupdate lokasi');
        watch.then(
          null,
          function(err) {
            latLong = null
            deferred.reject(err)
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

    var clearLatLong = function(watch) {
      console.log('watch location stopped');
      clear = $cordovaGeolocation.clearWatch(watch);
      deferred.resolve(clear);
      return deferred.promise;
    }

    return {
      getLatLong: getLatLong,
      clearLatLong: clearLatLong
    }

  });
