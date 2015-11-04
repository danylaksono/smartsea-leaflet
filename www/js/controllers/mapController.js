  angular.module('starter').controller('MapController', ['$scope',
  '$rootScope',
  '$cordovaGeolocation',
  '$stateParams',
  '$ionicPopup',
  '$filter',
  '$http',
  'BasemapService',
  'OverlayService',
  function(
    $scope,
    $rootScope,
    $cordovaGeolocation,
    $stateParams,
    $ionicPopup,
    $filter,
    $http,
    BasemapService,
    OverlayService
  ) {

    // adb -d install -r D:\_androidApp\smartsea-leaflet\platforms\android\build\outputs\apk\android-debug.apk

    $scope.$on("$stateChangeSuccess", function() {
      console.log('Platform state changed');
      $scope.locateWatch();
    });


    // Initialize Map Settings
    $scope.map = {
      layers: {
        baselayers: {},
        overlays: {}
      },
      markers: {},
      events: {
        map: {
          enable: ['context'],
          logic: 'emit'
        }
      },
      center: {
        autoDiscover: true,
        zoom: 13
      },
      controls: {}
    };

    $scope.basemapLayers = BasemapService.savedLayers;
    $scope.overlaidLayers = OverlayService.savedLayers;
    angular.extend($scope.map.layers.baselayers, $scope.basemapLayers);
    $scope.overlayer = $scope.map.layers.overlays;
    angular.forEach($scope.overlaidLayers, function(value, key) {
      if ($scope.overlaidLayers[key].checked) {
        $scope.overlayer[key] = $scope.overlaidLayers[key];
      }
    });


    // dynamic geolocation
    $scope.locateWatch = function() {
      console.log('Activate watch location');
      var watchOptions = {
        timeout: 15000,
        enableHighAccuracy: true
      };

      $scope.watch = $cordovaGeolocation.watchPosition(watchOptions);
      $scope.watch.then(
        null,
        function(err) {
          console.log("Location error!");
          if (err.code == 1) {
            $scope.showAlert('Peringatan!', 'Anda perlu mengaktifkan fungsi GPS');
          };
          console.log(err);
        },
        function(position) {
          //broadcast position to dashboard
          $rootScope.$broadcast('someEvent', position.coords);
          $scope.map.center.lat = position.coords.latitude;
          $scope.map.center.lng = position.coords.longitude;
          $scope.setMap($scope.map.center.lat, $scope.map.center.lng);
        }
      );
    };

    // set the map properties based on position
    $scope.setMap = function(lat, long){
      // label the marker
      var positionLabelLat = $filter('number')(lat, 4);
      var positionLabelLng = $filter('number')(long, 4);
      var positionLabel = positionLabelLat + "; " + positionLabelLng;
      //console.log(positionLabel);

      $scope.map.markers.now = {
        lat: lat,
        lng: long,
        label: {
          message: positionLabel,
          options: {
            noHide: true,
            direction: 'auto'
          }
        },
        focus: true,
        draggable: false,
        icon: {
          type: 'makiMarker',
          icon: 'ferry',
          color: '#00f',
          size: "l",
          iconAnchor: [10, 10],
          labelAnchor: [0, 8]
        }
      }
    };


    $scope.isWatching = true;
    $scope.toggleGeolocation = function() {
      $scope.isWatching = !$scope.isWatching;
      console.log($scope.isWatching);
      if ($scope.isWatching) {
        $scope.updateMapPosition();
        //$scope.locateWatch();
        $scope.showAlert('Pemberitahuan', 'Update posisi aktif')
      } else {
        //$cordovaGeolocation.clearWatch($scope.watch.watchID);
        $scope.showAlert('Pemberitahuan', 'Update posisi non aktif');
      }
    };



    $scope.toggleOverlay = function(layerName) {
      var overlays = $scope.map.layers.overlays;
      console.log(overlays[layerName]);
      if (overlays.hasOwnProperty(layerName)) {
        delete overlays[layerName];
      } else {
        overlays[layerName] = $scope.overlaidLayers[layerName];
      }
    };


    $scope.showAlert = function(title, message) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: message
      });
    };


    $scope.exitApp = function() {
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

    };


    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
      }
    };
    $scope.isGroupShown = function(group) {
      return $scope.shownGroup === group;
    };

    /*
    TODO:
      $ check if geolocation activated >> done
      $ fungsi untuk ambil atribut geojson berdasarkan posisi
          - openlayers containspoint
          - WPS as geojson
          - turf js
      $ fungsi untuk cek koneksi internet >> done
      $ wizard untuk landing page
      $ fungsi untuk memilih grid, download data berdasarkan grid tsb
      $ exit with back button >> done



    */



  }
]);
