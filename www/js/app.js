angular.module('starter', ['ionic', 'nemLogging', 'leaflet-directive', 'ngCordova', 'igTruncate'])

.run(function($ionicPlatform, $rootScope, $ionicPopup, $cordovaNetwork, $location, $ionicHistory) {

  $ionicPlatform.ready(function() {

    //check network
    var isOnline = $cordovaNetwork.isOnline()
    $rootScope.$broadcast('onlinestate', isOnline);
    var isOffline = $cordovaNetwork.isOffline()

    $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
      var onlineState = networkState;
      $rootScope.$broadcast('onlinewith', isOnline);
      console.log(onlineState);
    })

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
      var offlineState = networkState;
      alert("Anda berada dalam mode offline. Beberapa layer layanan dan fungsi unduh tidak dapat digunakan pada mode ini")
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
        template: 'Anda yakin mau menutup aplikasi SmartSea?',
        okText: 'OK ',
        cancelText: 'Tidak'
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
      'landing': {
        templateUrl: "templates/landing.html",
        controller: 'HomeController'
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
