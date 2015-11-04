// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'nemLogging', 'leaflet-directive', 'ngCordova', 'igTruncate' ])

.run(function($ionicPlatform, $rootScope, $cordovaNetwork, $location, $ionicHistory) {

  $ionicPlatform.ready(function() {

    //check network
    var isOnline = $cordovaNetwork.isOnline()
    var isOffline = $cordovaNetwork.isOffline()

    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
      var onlineState = networkState;
      console.log(onlineState);
    })

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
      var offlineState = networkState;
    })






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
    $ionicPlatform.registerBackButtonAction(function(e) {
      if ($location.path() === "/landing" || $location.path() === "landing") {
        window.close();
        ionic.Platform.exitApp();
      } else {
        $ionicHistory.goBack();
      }

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
