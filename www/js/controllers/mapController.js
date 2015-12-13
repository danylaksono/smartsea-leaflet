  angular.module('starter').controller('MapController', ['$scope',
    '$rootScope',
    '$cordovaGeolocation',
    '$cordovaToast',
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
      $cordovaToast,
      $stateParams,
      $ionicPopup,
      $filter,
      $http,
      BasemapService,
      OverlayService
    ) {

      // $ ionic build android
      // $ adb -d install -r D:\_androidApp\smartsea-leaflet\platforms\android\build\outputs\apk\android-debug.apk

      $scope.$on("$stateChangeSuccess", function() {
        console.log('Platform state changed');
        $scope.locateWatch();
      });

      // watch network connection state
      $scope.$on('onlinestate', function(event, isonline) {
        $scope.isOnline = isonline;
        console.log($scope.isOnline);
      })


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



      /*
      http://175.111.91.247:8001/geoserver/geonode/wms?service=WMS&version=1.1.0&request=GetFeatureInfo&layers=geonode:layertataruanglaut&styles=&bbox=401800.2834385319,9134660.160813307,403303.3296813526,9135787.445495423&width=768&height=576&srs=EPSG:32749&info_format=application/json&query_layers=geonode:layertataruanglaut&x=402558&y=9135207
      var getfiurl = '175.111.91.247:8001/geoserver/wms?service=wms& \
      version=1.1.1&request=GetFeatureInfo&info_format=application/json& \
      layers=geonode:layertataruanglaut&x=402558&y=9135207& \
      query_layers=geonode:layertataruanglaut'

      $http({
        method: 'GET',
        url: getfiurl
      }).then(function successCallback(response) {
        console.log(response);
      }, function errorCallback(response) {
        console.log('err', response);
      });

      */

      /*
      $http.get("./assets/localStorage/rencanapolaruang.geojson").success(function(data, status) {
        //OverlayService.localLayers['dummy'] = {
        $scope.map.layers.overlays['dummy'] = {
          name: 'Dummyzone',
          text: 'Dummy Zone',
          checked: false,
          disabled: true,
          type: 'geoJSONShape',
          data: data,
          visible: true,
          layerOptions: {
            style: {
              color: '#00D',
              fillColor: 'red',
              weight: 2.0,
              opacity: 0.6,
              fillOpacity: 0.2
            }
          }
        };
      });

      */

      $scope.basemapLayers = BasemapService.savedLayers;
      $scope.overlaidLayers = OverlayService.savedLayers;
      /*$scope.localLayers = OverlayService.localLayers;*/
      angular.extend($scope.map.layers.baselayers, $scope.basemapLayers);
      $scope.overlayer = $scope.map.layers.overlays;

      //testing local storage. will be implemented as login succeeded
      // ---- KRB merapi
      /*$http.get("./assets/localStorage/dummy.geojson").success(function(data, status) {
          angular.extend($scope.overlayer, {
              dummy: {
                  name:'Dummyzone',
                  text:'Dummy Zone',
                  checked: false,
                  disabled: true,
                  type: 'geoJSONShape',
                  data: data,
                  visible: true,
                  layerOptions: {
                      style: {
                          color: '#00D',
                          fillColor: 'red',
                          weight: 2.0,
                          opacity: 0.6,
                          fillOpacity: 0.2
                      }
                  }
              }
          });
      });*/

      angular.forEach($scope.overlaidLayers, function(value, key) {
        if ($scope.overlaidLayers[key].checked) {
          $scope.overlayer[key] = $scope.overlaidLayers[key];
        }
      });
      // for local layer
      /*angular.forEach($scope.localLayers, function(value, key) {
        if ($scope.localLayers[key].checked) {
          $scope.overlayer[key] = $scope.localLayers[key];
        }
      });*/

      // dynamic geolocation
      $scope.locateWatch = function() {
        console.log('Activate watch location');
        var watchOptions = {
          timeout: 15000,
          enableHighAccuracy: true
        };

        $scope.watch = $cordovaGeolocation.watchPosition(watchOptions);
        console.log('Watch ID:', $scope.watch.watchID);
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
            //broadcast position to dashboard controller
            $rootScope.$broadcast('someEvent', position.coords);
            $scope.currentPos = [position.coords.latitude, position.coords.longitude];
            //set the map with these values
            $scope.setMap(position.coords.latitude, position.coords.longitude);

            $scope.zoomToLocation = function (lat,long){
              $scope.map.center.lat = position.coords.latitude;
              $scope.map.center.lng = position.coords.longitude;
              $scope.map.center.zoom = 16;
            }


          }
        );
      };

      // set the map properties based on position
      $scope.setMap = function(lat, long) {
        // label the marker
        var positionLabelLat = $filter('number')(lat, 4);
        var positionLabelLng = $filter('number')(long, 4);
        var positionLabel = positionLabelLat + "; " + positionLabelLng;
        //console.log(positionLabel);

        //current position as Geojson point
        var currentPos = {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [positionLabelLat, positionLabelLng]
            },
            "properties": {
              "name": "Current Position"
            }
          }
          // try calling in dummy zone
        var overLayingZone = $scope.map.layers.overlays['dummy'];
        var overLayingAdmin = OverlayService.savedLayers['batasdesa']
          // turf tag operation
          //var tagged = turf.tag(currentPos, overLayingAdmin,'zone', 'abb');

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
            iconUrl: './assets/ferry.png',
            color: '#00f',
            size: "l",
            iconAnchor: [10, 10],
            labelAnchor: [0, 8]
          }
        }
      };

      // need this, since device timeout seems to be differently implemented across devices
      $scope.isWatching = true;
      $scope.toggleGeolocation = function() {
        $scope.isWatching = !$scope.isWatching;
        console.log("is watching location", $scope.isWatching);
        if ($scope.isWatching) {
          $scope.locateWatch();
          $scope.showToast('Pembaruan posisi aktif', 'short', 'bottom')
        } else {
          $cordovaGeolocation.clearWatch($scope.watch.watchID);
          console.log('Stop WatchID:', $scope.watch.watchID);
          $scope.showToast('Pembaruan posisi non-aktif', 'short', 'bottom')
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

      $scope.showToast = function(message, duration, location) {
        $cordovaToast.show(message, duration, location).then(function(success) {
          console.log("activate toast");
        }, function(error) {
          console.log("The toast was not shown due to " + error);
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



    }
  ]);
