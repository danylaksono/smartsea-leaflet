angular.module('starter', ['ionic', 'nemLogging', 'ui-leaflet', 'ngCordova', 'igTruncate', 'firebase'])

.run(function($ionicPlatform, $rootScope, $ionicPopup, $cordovaNetwork, $cordovaDeviceOrientation, $location, $ionicHistory) {

  $ionicPlatform.ready(function() {
    //check network
    // turn this off, implementing deviceready event in controller aside from broadcasting
    /*
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

    */

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

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(0);
  $stateProvider
  .state('disclamer', {
      url: '/disclamer',
      templateUrl: 'templates/disclamer.html',
      controller: 'disclamerController'
    })
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
          templateUrl: "templates/bantuan.html",
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
    .state('app.map', {
      url: "/map",
      views: {
        'mainContent': {
          templateUrl: "templates/map.html"
        }
      }
    })
    .state('app.profil', {
      url: "/profil",
      views: {
        'mainContent': {
          templateUrl: "templates/profil.html",
          controller: 'ProfilController'
        }
      }
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
  .state('app.help', {
    url: "/help",
    views: {
      'mainContent': {
        templateUrl: "templates/bantuan.html"
      }
    }
  })

  .state('app.ubahAva', {
    url: "/ubahava",
    views: {
      'mainContent': {
        templateUrl: "templates/ubah_ava.html",
        controller: 'gantiAvaController'
      }
    }
  })

  .state('app.pengaturan', {
    url: "/pengaturan",
    views: {
      'mainContent': {
        templateUrl: "templates/pengaturan.html"
      }
    }
  })

  .state('app.daftar', {
    url: "/daftar",
    views: {
      'mainContent': {
        templateUrl: "templates/daftar.html",
        controller: "daftarController"
      }
    }
  })

  $urlRouterProvider.otherwise('/disclamer');


});
