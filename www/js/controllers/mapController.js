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
        legend: {
          url: "http://103.7.52.65:6080/arcgis/rest/services/16dset_alokasi_ruang_laut/Kabupaten_Batu_Bara_RZWP3K/MapServer/legend?f=pjson",
          legendClass: "info legend-esri",
          position: "bottomleft"
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



      $scope.overlaidLayers = OverlayService.savedLayers;
      //angular.extend($scope.overlaidLayers, OverlayService.savedLayers);
      console.log("overlaidlayers", $scope.overlaidLayers);
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
        leafletData.getMap().then(function(map) {

          var identifiedFeature;
          var pane = document.getElementById('selectedFeatures');

          map.on('click', function(e) {
            pane.innerHTML = 'Loading';
            if (identifiedFeature) {
              map.removeLayer(identifiedFeature);
            }
            $scope.map.layers.overlays.banggai.identify().on(map).at(e.latlng).run(function(error, featureCollection) {
              console.log(featureCollection.features[0]);
              if (featureCollection.features.length > 0) {
                identifiedFeature = L.geoJson(featureCollection.features[0]).addTo(map);
                
                pane.innerHTML = "magnitude: " + magTrimmed;
              } else {
                pane.innerHTML = 'No features identified.';
              }
            });
          });

          /*
          $scope.Lgeojsonzone = L.geoJson($scope.geojsonzone);
          console.log($scope.Lgeojsonzone);
          var pipolygon = leafletPip.pointInLayer([long, lat], $scope.Lgeojsonzone, true);
          var positionLabel = ''
            //console.log(pipolygon)
          if (pipolygon.hasOwnProperty('0')) {
            positionLabel = "Zona : " + pipolygon[0].feature.properties.Sub_Zona;
          } else {
            positionLabel = "Di luar zona laut";
            //console.log('Zone undetected. Possibly outside of geojson area')
          }
          */

          $scope.map.markers.now = {
            lat: lat,
            lng: long,
            label: {
              message: "Di Luar Zona",
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
