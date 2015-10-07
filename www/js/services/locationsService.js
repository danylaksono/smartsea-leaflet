angular.module('starter').factory('LocationsService', [function($scope, $cordovaBackgroundGeolocation) {

  var locationsObj = {};

  locationsObj.savedLocations = [{
    name: "Washington D.C., USA",
    lat: 38.8951100,
    lng: -77.0363700
  }];

  var posOptions = {
    timeout: 5000,
    enableHighAccuracy: true,
    maximumAge: 5000
  };

  document.addEventListener("deviceready", function() {
    console.log('activate background geolocation');

    $cordovaBackgroundGeolocation.configure(posOptions)
      .then(function(location) {
        console.log('sampe sini');
        console.log(location);
      });

    $cordovaBackgroundGeolocation.start();

  });


  return locationsObj;

}]);
