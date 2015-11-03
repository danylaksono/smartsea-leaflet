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
