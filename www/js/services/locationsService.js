angular.module('starter').factory('LocationsService', [function($scope,  $cordovaBackgroundGeolocation) {

  var locationsObj = {};

  locationsObj.savedLocations = [{
    name: "Washington D.C., USA",
    lat: 38.8951100,
    lng: -77.0363700
  }];


  /*
 document.addEventListener("deviceready", function () {

    console.log('activate background geolocation');
    // `configure` calls `start` internally
    $cordovaBackgroundGeolocation.configure(options)
    .then(
      null, // Background never resolves
      function (err) { // error callback
        console.error(err);
      },
      function (location) { // notify callback
        console.log(location);
      });


    $scope.stopBackgroundGeolocation = function () {
      $cordovaBackgroundGeolocation.stop();
    };

  });
  */

  return locationsObj;

}]);
