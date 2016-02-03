angular.module('starter', ['ionic', 'nemLogging', 'leaflet-directive', 'ngCordova', 'igTruncate'])

.run(function($ionicPlatform, $rootScope, $ionicPopup, $cordovaNetwork, $cordovaDeviceOrientation, $location, $ionicHistory) {

  $ionicPlatform.ready(function() {

    //check network
    var isOnline = $cordovaNetwork.isOnline()
    $rootScope.$broadcast('onlinestate', isOnline);
    var isOffline = $cordovaNetwork.isOffline()

    $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
      var onlineState = networkState;
      $rootScope.$broadcast('onlinewith', onlineState);
      console.log(onlineState);
    })

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
      var offlineState = networkState;
      alert("Anda berada dalam mode offline")
    })

    //check GPS
    cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
      if (!enabled) {
        alert("SmartSea memerlukan GPS aktif pada perangkat ini. Silahkan aktifkan GPS Anda");
        cordova.plugins.diagnostic.switchToLocationSettings();
      }
    }, function(error) {
      console.error("The following error occurred: " + error);
    });



    if (navigator.fusion) {
      console.log('SensorFusion available.');

      function success(result) {
        alert('new Mode: ' + result);
      };

      function err(error) {
        alert('Error: ' + error);
      };


      navigator.fusion.setMode(onSuccess, onError, 5);

      navigator.fusion.watchSensorFusion(function(result) {
        console.log(result)
        $rootScope.$broadcast('sensorvalue', result);
      }, function(err) {
        console.log('error', err);
      }, {
        frequency: 10
      });
    };



    document.addEventListener("deviceready", onDeviceReady, false);


    //check compass. erroneous on Cordova 3. Waiting for bugfix to apply
    /*
    $cordovaDeviceOrientation.getCurrentHeading().then(function(result) {
      var magneticHeading = result.magneticHeading;
      console.log("magnetic", magneticHeading)
      var trueHeading = result.trueHeading;
      var accuracy = result.headingAccuracy;
      var timeStamp = result.timestamp;
    }, function(err) {
      console.log("The following error occurred: " + err);
    });

    */



    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      window.cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

    //register back button on device
    var exitApp = function() {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Keluar Aplikasi',
        template: 'Tutup aplikasi SmartSea?',
        okText: 'OK ',
        cancelText: 'Batal'
      });
      confirmPopup.then(function(res) {
        if (res) {
          window.close();
          ionic.Platform.exitApp();
        } else {}
      });
    }

    $ionicPlatform.registerBackButtonAction(function(e) {
      exitApp();
      e.preventDefault();
      return false;
    }, 101);

  });

})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('home', {
    url: "/home",
    abstract: true,
    templateUrl: "templates/home.html"
  })

  .state('home.landing', {
      url: "/landing",
      views: {
        'landingContent': {
          templateUrl: "templates/landing.html",
          controller: 'HomeController'
        }
      }
    })
    .state('home.wizard', {
      url: "/wizard",
      views: {
        'landingContent': {
          templateUrl: "templates/wizard.html",
          controller: 'WizardController'
        }
      }
    })
    .state('home.help', {
      url: "/help",
      views: {
        'landingContent': {
          templateUrl: "templates/help.html",
          controller: 'HelpController'
        }
      }
    })


  .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'MapController'
    })
    .state('app.dashboard', {
      url: "/dashboard",
      views: {
        'mainContent': {
          templateUrl: "templates/dashboard.html",
          controller: 'DashboardController'
        }
      }
    })

  .state('app.map', {
    url: "/map",
    views: {
      'mainContent': {
        templateUrl: "templates/map.html"
      }
    }
  })

  .state('app.help', {
    url: "/help",
    views: {
      'mainContent': {
        templateUrl: "templates/bantuan.html"
      }
    }
  })

  $urlRouterProvider.otherwise('/home/landing');

});
