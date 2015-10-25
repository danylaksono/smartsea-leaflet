angular.module('starter').controller('MapController', ['$scope',
  '$cordovaGeolocation',
  '$stateParams',
  '$ionicModal',
  '$ionicPopup',
  '$filter',
  '$http',
  //'LocationsService',
  'InstructionsService',
  function(
    $scope,
    $cordovaGeolocation,
    $stateParams,
    $ionicModal,
    $ionicPopup,
    $filter,
    $http,
    //LocationsService,
    InstructionsService
  ) {

    /*
    predefined layers
    */

    $scope.basemapLayers = {
      osm: {
        name: 'OpenStreetMap',
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        type: 'xyz',
        visible: true,
        layerParams: {
          showOnSelector: false
        }
      },
      surfer: {
        name: "OpenMapSurfer",
        type: "xyz",
        url: "http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}",
        visible: true,
        layerOptions: {
          attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 20
        },
        layerParams: {
          showOnSelector: false
        }
      }
    };

    $scope.overlaidLayers = {
      batasdesa: {
        name: 'Batas Desa',
        type: 'wms',
        url: 'http://localhost:8080/geoserver/smartsea/wms',
        visible: true,
        version: '1.1.0',
        layerOptions: {
          layers: 'smartsea:Batas_Desa',
          format: 'image/png',
          crs: L.CRS.EPSG32749,
          opacity: 0.5,
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
    };


    // Initial Map Settings
    $scope.map = {
      layers: {
        baselayers: {
          surfer: $scope.basemapLayers.surfer
        },
        overlays: {
          batasdesa: $scope.overlaidLayers.batasdesa
        }
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
        enableHighAccuracy: false // may cause errors if true
      };

      $scope.watch = $cordovaGeolocation.watchPosition(watchOptions);
      $scope.watch.then(
        null,
        function(err) {
          console.log("Location error!");
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
          console.log(pointNow);


        }
      );
    };


    $scope.isWatching = true;
    $scope.toggleWatch = function() {
      console.log($scope.isWatching);
      $scope.isWatching = !$scope.isWatching;
      if ($scope.isWatching) {
        $scope.locateWatch();
        console.log('watch');
        } else {
        $cordovaGeolocation.clearWatch($scope.watch.watchId);
        console.log('clear watch');
      }
    };


    //TODO:masukkan fungsi provider layers dalam service tersendiri
    $scope.layersList = {
      batasdesa: {
        text: "Batas Desa",
        name: "batasdesa",
        checked: true
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


    $scope.showAlert = function(message) {
      var alertPopup = $ionicPopup.alert({
        title: 'Unduh Data',
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
