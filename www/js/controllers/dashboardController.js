angular.module('starter').controller('DashboardController', ['$scope',
  '$cordovaDeviceOrientation',
  '$cordovaNetwork',
  function($scope,
    $cordovaDeviceOrientation,
    $cordovaNetwork
  ) {

    //watch broadcasted event from rootScope
    $scope.$on('someEvent', function(event, data) {
      $scope.position = data;
    });

    $scope.$on('onlinestate', function(event, networkState) {
      $scope.onlineState = networkState;
      console.log($scope.onlineState);
    })


    $scope.$on("$stateChangeSuccess", function() {
      console.log('starting compass');
      $scope.startCompass();
    });

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
    - detect GPS and implement cordova diagnostic plugins >> done
    - detect network (cordova network information plugin) >> done
    - add login and implement pouchdb for user auth
    - add download wizard state

*/
