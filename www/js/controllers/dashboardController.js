angular.module('starter').controller('DashboardController', ['$scope',
  '$cordovaDeviceOrientation',
  function($scope,
    $cordovaDeviceOrientation
  ) {

    //watch broadcasted event from rootScope
    $scope.$on('someEvent', function(event, data) {
      $scope.position = data;
    });

    if (window.DeviceOrientationEvent) {
      console.log("DeviceOrientation is supported");
    }

    $scope.$on("$stateChangeSuccess", function() {
      console.log('starting compass');
      $scope.startCompass();
    });
    
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log(navigator.compass);
    }

    $scope.startCompass = function() {
      var options = {
        frequency: 3000,
        filter: true
      };

      $scope.watchCompass = $cordovaDeviceOrientation.getCurrentHeading(options);
      $scope.watchCompass.then(
        null,
        function(err) {
          console.log(err)
        },
        function(result) { // updates constantly (depending on frequency value)
          $scope.deg = result.trueHeading;
          console.log($scope.deg);
          var magneticHeading = result.magneticHeading;
          var accuracy = result.headingAccuracy;
          var timeStamp = result.timestamp;
        });

    };





  }
]);


/*
  Todo next:
    - employ geolocation service into map controller >> done
    - change tombatossals' angular leaflet with ui-leaflet -- skip
    - add ui bootstrap >> done
    - add components to dashboard (coordinates (utm and geo), heading, speed, compass)
    - detect GPS and implement cordova diagnostic plugins
    - detect network (cordova network information plugin)
    - add login and implement pouchdb for user auth
    - add download wizard state

*/
