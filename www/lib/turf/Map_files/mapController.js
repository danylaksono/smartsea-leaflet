angular.module('starter').controller('MapController', ['$scope',
  '$cordovaGeolocation',
  '$stateParams',
  '$ionicModal',
  '$ionicPopup',
  '$filter',
  '$http',
  'BasemapService',
  'OverlayService',
  function(
    $scope,
    $cordovaGeolocation,
    $stateParams,
    $ionicModal,
    $ionicPopup,
    $filter,
    $http,
    BasemapService,
    OverlayService
  ) {

    $scope.basemapLayers = BasemapService.savedLayers;
    $scope.overlaidLayers = OverlayService.savedLayers;


    // Initial Map Settings
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

    angular.extend($scope.map.layers.baselayers, $scope.basemapLayers);
    angular.extend($scope.map.layers.overlays, $scope.overlaidLayers);

    /*
    // add some more overlay layers (locally)
    $http.get("../../assets/desa_sleman.geojson").success(function(data, status) {
      console.log(status);
      angular.extend($scope.map.layers.overlays, {
        batasdesa: {
          name: 'Batas Desa',
          type: 'geoJSONShape',
          visible: true,
          data: data,
          layerOptions: {
            style: {
              color: '#00D',
              fillColor: 'red',
              weight: 2.0,
              opacity: 0.6,
              fillOpacity: 0.2
            }
          },
          layerParams: {
            showOnSelector: false
          }
        }
      });
    });

    */

    $scope.$on("$stateChangeSuccess", function() {
      console.log('state changed');
      $scope.locateWatch();
    });

    /**
     * Center map on user's current position
     */

    // static geolocation
    $scope.locateStatic = function() {
      console.log('activate geolocation');
      var geoSettings = {
        frequency: 1000,
        timeout: 3000,
        enableHighAccuracy: false
      };

      var geo = $cordovaGeolocation.getCurrentPosition(geoSettings);

      geo.then(function(position) {
        $scope.map.center.lat = position.coords.latitude;
        $scope.map.center.lng = position.coords.longitude;
        $scope.map.center.zoom = 15;

        $scope.map.markers.now = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          message: "test",
          focus: true,
          draggable: false
        };
      }, function(err) {
        // error
        console.log("Location error!");
        console.log(err);
      });

    };

    // dynamic geolocation
    $scope.locateWatch = function() {
      console.log('activate watch location');
      var watchOptions = {
        timeout: 3000,
        enableHighAccuracy: true // may cause errors if true
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
          $scope.map.center.lat = position.coords.latitude;
          $scope.map.center.lng = position.coords.longitude;
          $scope.map.center.zoom = 14;

          var positionLabelLat = $filter('number')($scope.map.center.lat, 4);
          var positionLabelLng = $filter('number')($scope.map.center.lng, 4);
          var positionLabel = positionLabelLat + "; " + positionLabelLng;

          $scope.map.markers.now = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
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
          };

          // turf point in polygon
          var pointNow = turf.point([position.coords.longitude, position.coords.latitude]);
          //console.log(pointNow);

        }
      );
    };


    $scope.isWatching = true;
    $scope.toggleGeolocation = function() {
      $scope.isWatching = !$scope.isWatching;
      console.log($scope.isWatching);
      if ($scope.isWatching) {
          $scope.locateWatch();
          $scope.showAlert('Pemberitahuan', 'Update posisi aktif')
      } else {
          $cordovaGeolocation.clearWatch($scope.watch.watchId);
          $scope.showAlert('Pemberitahuan', 'Update posisi non aktif');
      }

    };


    $scope.toggleOverlay = function(layerName) {
      var overlays = $scope.map.layers.overlays;
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



    /*
    TODO:
      $ check if geolocation activated
      $ fungsi untuk ambil atribut geojson berdasarkan posisi
          - openlayers containspoint
          - WPS as geojson
          - turf js
      $ fungsi untuk cek koneksi internet
      $ wizard untuk landing page
      $ fungsi untuk memilih grid, download data berdasarkan grid tsb
      $ exit with back button



    */



  }
]);
