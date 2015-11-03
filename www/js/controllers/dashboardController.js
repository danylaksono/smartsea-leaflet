angular.module('starter').controller('DashboardController', ['$scope',
  'GeolocationService',
  function($scope,
    GeolocationService
  ) {



    GeolocationService.getLatLong().then(
      function(latLong) {
          $scope.position = latLong;
        console.log('LatLong=', $scope.position.lat);
      }
    );

  }
]);


/*
  Todo next:
    - employ geolocation service into map controller
    - change tombatossals' angular leaflet with ui-leaflet
    - add ui bootstrap
    - add components to dashboard (coordinates (utm and geo), heading, speed, compass)
    - detect GPS and implement cordova diagnostic plugins
    - detect network (cordova network information plugin)
    - add login and implement pouchdb for user auth
    - add download wizard state

*/
