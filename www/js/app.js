// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'nemLogging','leaflet-directive', 'ngCordova', 'igTruncate'])

.run(function($ionicPlatform, $ionicPopup, $rootScope, $location) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      window.cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  // check if internet is connected
  if (window.Connection) {
    if (navigator.connection.type == Connection.NONE) {
      $ionicPopup.confirm({
          title: "Internet Disconnected",
          content: "The internet is disconnected on your device."
        })
        .then(function(result) {
          if (!result) {
            ionic.Platform.exitApp();
          }
        });
    }
  };

  //register back button on device
  $ionicPlatform.registerBackButtonAction(function(e) {

    e.preventDefault();

    function showConfirm() {
      var confirmPopup = $ionicPopup.confirm({
        title: '<strong>Exit SmartSea</strong>',
        template: 'Are you sure you want to exit?'
      });

      confirmPopup.then(function(res) {
        if (res) {
          ionic.Platform.exitApp();
        } else {
          // Don't close
        }
      });
    }

    // Is there a page to go back to?
    if ($rootScope.$viewHistory.backView) {
      // Go back in history
      $rootScope.$viewHistory.backView.go();
    } else {
      // This is the last page: Show confirmation popup
      showConfirm();
    }

    return false;
  }, 101);

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
