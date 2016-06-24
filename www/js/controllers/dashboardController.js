angular.module('starter').controller('DashboardController', ['$scope',
  '$http',
  '$filter',
  '$cordovaDeviceOrientation',
  '$cordovaNetwork',
  'loginService',
  'sessionService',
  '$ionicPopup',
  function($scope,
    $http,
    $filter,
    $cordovaDeviceOrientation,
    $cordovaNetwork,
    loginService,
    sessionService,
    $ionicPopup
  ) {

    document.addEventListener("deviceready", function () {
      // check network connection
      $scope.isOnline = $cordovaNetwork.isOnline()
      $scope.connectionType = $cordovaNetwork.getNetwork()

      //console.log("is online using cordovanetwork:", $scope.connectionType)

      // handling device's compass
      var options = {
        frequency: 500
      }
      var watch = $cordovaDeviceOrientation.watchHeading(options).then(
        null,
        function(error){
          //console.log(error)
        },
        function(result){
          $scope.mag = -result.magneticHeading;
          //console.log($scope.mag);
        }
      )
    });

    // Am I online? (note: need to run in a device to test)
    // turning this off (see notes in app.js)
    /*
    $scope.isOnline2 = false;
    $scope.$on('onlinewith', function(event, networkState) {
      $scope.onlineState = networkState;
      if ($scope.onlineState != "none") {
          $scope.isOnline2 = true
      };
      console.log("Am I online?", $scope.onlineState);
    });
    */

    // Handling event with GPS reading

    console.log($scope.isLogin);
        
    $scope.$on('someEvent', function(event, data) {
      $scope.position = data;
      //define lat and long for weather API
      $scope.lat = $filter('number')($scope.position.latitude,2);
      $scope.long = $filter('number')($scope.position.longitude,2);
      //console.log("current pos:"+ $scope.lat + '  - '+ $scope.long);
      //get the data
      var url = 'http://api.openweathermap.org/data/2.5/weather?lat='+ $scope.lat+'&lon='+ $scope.long+'&appid=09284f9e9d4902bc5e84294ad386b900&units=metric';
      //console.log(url);
      $http({
        method: 'GET',
        url: url
      }).then(function successCallback(response) {
          //set some variables
          $scope.weatherData = response.data;
          $scope.weatherData2 = $scope.weatherData.weather[0];
          $scope.weatherIcon = 'http://openweathermap.org/img/w/'+ $scope.weatherData2.icon +'.png'
          //console.log($scope.weatherIcon)
        }, function errorCallback(response) {
          //console.log(response)
        });

    }); //end of broadcasted event: position




  }
]);
