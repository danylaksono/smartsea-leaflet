angular.module('starter').controller('MapController', ['$scope',
  '$cordovaGeolocation',
  '$stateParams',
  '$ionicModal',
  '$ionicPopup',
  '$filter',
  '$http',
  'BasemapService',
  'OverlayService',
  'GeolocationService',
  function(
    $scope,
    $cordovaGeolocation,
    $stateParams,
    $ionicModal,
    $ionicPopup,
    $filter,
    $http,
    BasemapService,
    OverlayService,
    GeolocationService
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
      if ($scope.overlaidLayers[key].checked){
        $scope.overlayer[key] = $scope.overlaidLayers[key];
      }
    });

    //angular.extend($scope.map.layers.overlays, $scope.overlaidLayers);

    /*
        GeolocationService.getPosition().then(
          function(position) {
            $scope.coords = position.coords;
          },
          function(err) {
            console.log('getCurrentPosition error: ' + angular.toJson(err));
          });


        console.log($scope.coords);


        $scope.updateMapPosition = function() {
          console.log('updating geolocation');
          $scope.map.center.lat = $scope.coords.latitude;
          $scope.map.center.lng = $scope.coords.longitude;
          $scope.map.center.zoom = 14;

          var positionLabelLat = $filter('number')($scope.map.center.lat, 4);
          var positionLabelLng = $filter('number')($scope.map.center.lng, 4);
          var positionLabel = positionLabelLat + "; " + positionLabelLng;

          $scope.map.markers.now = {
            lat: $scope.coords.latitude,
            lng: $scope.coords.latitude,
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
        };
      */


    // dynamic geolocation
    $scope.locateWatch = function() {
      console.log('activate watch location');
      var watchOptions = {
        timeout: 10000,
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
        $cordovaGeolocation.clearWatch($scope.watch.watchID);
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


    /*
    $scope.toggleOverlay = function() {
    var overlays = $scope.map.layers.overlays;

    angular.forEach($scope.overlaidLayers, function(value, key) {
        $scope.$watchGroup($scope.overlaidLayers.[key].checked, function() {
          if (!$scope.overlaidLayers[key].checked) {
            console.log('turning layer ' + overlays[key] +'off');
            delete overlays[key];
          } else {
            console.log('turning layer ' + overlays[key] +'on');
            overlays[key] = $scope.overlaidLayers[key];
        }
      }
    });
    */



    $scope.showAlert = function(title, message) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: message
      });
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
