angular.module('starter').controller('DashboardController', ['$scope',
  '$cordovaDeviceOrientation',
  'GeolocationService',
  function($scope,
    $cordovaDeviceOrientation,
    GeolocationService
  ) {


    var options = {
        frequency: 3000
      }

      /*
      $scope.startCompass = function() {
        $scope.watchCompass = $cordovaDeviceOrientation.watchHeading(options);
        $scope.watchCompass.then(
          null,
          function(err) {
            console.log(err)
          },
          function(result) { // updates constantly (depending on frequency value)
            $scope.deg = result.trueHeading;
            var magneticHeading = result.magneticHeading;
            var accuracy = result.headingAccuracy;
            var timeStamp = result.timestamp;
          });

      };


      $scope.$on("$stateChangeSuccess", function() {
        console.log('starting compass');
        $scope.startCompass();
      });
      */
  }
]);


/*
  Todo next:
    - employ geolocation service into map controller
    - change tombatossals' angular leaflet with ui-leaflet -- skip
    - add ui bootstrap
    - add components to dashboard (coordinates (utm and geo), heading, speed, compass)
    - detect GPS and implement cordova diagnostic plugins
    - detect network (cordova network information plugin)
    - add login and implement pouchdb for user auth
    - add download wizard state

*/
