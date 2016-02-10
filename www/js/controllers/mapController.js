  angular.module('starter').controller('MapController', ['$scope',
    '$rootScope',
    '$cordovaGeolocation',
    '$cordovaToast',
    '$cordovaSQLite',
    '$stateParams',
    '$ionicPopup',
    '$filter',
    '$http',
    'localStorage',
    'leafletData',
    'BasemapService',
    'OverlayService',
    function(
      $scope,
      $rootScope,
      $cordovaGeolocation,
      $cordovaToast,
      $cordovaSQLite,
      $stateParams,
      $ionicPopup,
      $filter,
      $http,
      localStorage,
      leafletData,
      BasemapService,
      OverlayService
    ) {

      // $ ionic build android
      // $ adb -d install -r D:\_androidApp\smartsea-leaflet\platforms\android\build\outputs\apk\android-debug.apk

      $scope.$on("$stateChangeSuccess", function() {
        //console.log('Platform state changed');
        $scope.locateWatch();
      });

      // watch network connection state
      $scope.$on('onlinestate', function(event, isonline) {
        $scope.isOnline = isonline;
        //console.log($scope.isOnline);
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


      // getting data
      $http.get("./assets/localStorage/alokasi_ruang.geojson")
        .success(function(data) {
          localStorage.setObject('zona', data);
        });

      $scope.geojsonzone = localStorage.getObject('zona');
      //console.log('content of ', $scope.geojsonzone);
      var jsonlib = {
        zona: {
          name: 'polaruang',
          text: 'Pola Ruang',
          checked: true,
          disabled: false,
          type: 'geoJSONShape',
          data: $scope.geojsonzone,
          visible: true,
          layerOptions: {
            style: {
              color: '#00D',
              fillColor: 'red',
              weight: 2.0,
              opacity: 0.6,
              fillOpacity: 0.2,
              showOnSelector: false
            },
            layerParams: {
              showOnSelector: false
            }
          }
        }
      };


      $scope.overlaidLayers = {};
      angular.extend($scope.overlaidLayers, jsonlib);
      //console.log("overlaidlayers", $scope.overlaidLayers);
      $scope.basemapLayers = BasemapService.savedLayers;
      angular.extend($scope.map.layers.baselayers, $scope.basemapLayers);
      angular.forEach($scope.overlaidLayers, function(value, key) {
        if ($scope.overlaidLayers[key].checked) {
          $scope.map.layers.overlays[key] = $scope.overlaidLayers[key];
        }
        //console.log($scope.map.layers.overlays[key])
      });



      // dynamic geolocation
      $scope.locateWatch = function() {
        //console.log('Activate watch location');
        var watchOptions = {
          timeout: 15000,
          enableHighAccuracy: true
        };

        $scope.watch = $cordovaGeolocation.watchPosition(watchOptions);

        $scope.watch.then(
          null,
          function(err) {
            //console.log("Location error!");
            if (err.code == 1) {
              $scope.showAlert('Peringatan!', 'Anda perlu mengaktifkan fungsi GPS');
            };

          },
          function(position) {
            //broadcast position to dashboard controller
            $rootScope.$broadcast('someEvent', position.coords);
            $scope.currentPos = [position.coords.latitude, position.coords.longitude];
            //set the map with these values
            $scope.setMap(position.coords.latitude, position.coords.longitude);

            $scope.zoomToLocation = function() {
              $scope.map.center.lat = position.coords.latitude;
              $scope.map.center.lng = position.coords.longitude;
              $scope.map.center.zoom = 13;
              leafletData.getMap().then(function(map) {
                if (!map.getBounds().contains([position.coords.latitude, position.coords.longitude])) {
                  map.panTo([position.coords.latitude, position.coords.longitude])
                }

              });

            }
          }
        );
      };

      // set the map properties based on position
      $scope.setMap = function(lat, long) {
        var pipolygon = {};
        leafletData.getMap().then(function(map) {
          $scope.Lgeojsonzone = L.geoJson($scope.geojsonzone)
          var pipolygon = leafletPip.pointInLayer([long, lat], $scope.Lgeojsonzone, true);
          var positionLabel = ''
          //console.log(pipolygon)
          if (pipolygon.hasOwnProperty('0')) {
            //positionLabel = "Zona : " + pipolygon[0].feature.properties.DESA;
            positionLabel = "Zona : " + pipolygon[0].feature.properties.Sub_Zona;
            //console.log('Zone detected')
          } else {
            positionLabel = "Di luar zona laut";
            //console.log('Zone undetected. Possibly outside of geojson area')
          }

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
            focus: false,
            draggable: false,
            icon: {
              iconUrl: './assets/ferry.png',
              color: '#00f',
              size: "l",
              iconAnchor: [10, 10],
              labelAnchor: [0, 8]
            }
          }
        });

      };

      // need this, since device timeout seems to be differently implemented across devices
      $scope.isWatching = true;
      $scope.toggleGeolocation = function() {
        $scope.isWatching = !$scope.isWatching;
        //console.log("is watching location", $scope.isWatching);
        if ($scope.isWatching) {
          $scope.zoomToLocation();
          $scope.showToast('Mode jelajah non-aktif', 'short', 'bottom')
        } else {
          $cordovaGeolocation.clearWatch($scope.watch.watchID);
          //console.log('Stop WatchID:', $scope.watch.watchID);
          $scope.showToast('Mode jelajah aktif', 'short', 'bottom')
        }
      };

      $scope.toggleOverlay = function(layerName) {
        var overlays = $scope.map.layers.overlays;
        console.log('toggle overlays', $scope.map.layers.overlays[layerName]);
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

      $scope.showToast = function(message, duration, location) {
        $cordovaToast.show(message, duration, location).then(function(success) {
          //console.log("activate toast");
        }, function(error) {
          //console.log("The toast was not shown due to " + error);
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



    }
  ]);
