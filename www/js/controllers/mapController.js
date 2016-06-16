  angular.module('starter').controller('MapController', ['$scope',
    '$rootScope',
    '$cordovaGeolocation',
    '$cordovaToast',
    '$cordovaSQLite',
    '$state',
    '$stateParams',
    '$ionicPopup',
    '$filter',
    '$http',
    'localStorage',
    'leafletData',
    'BasemapService',
    'OverlayService',
    'leafletMapEvents',
    'sessionService',
    'loginService',
    function(
      $scope,
      $rootScope,
      $cordovaGeolocation,
      $cordovaToast,
      $cordovaSQLite,
      $state,
      $stateParams,
      $ionicPopup,
      $filter,
      $http,
      localStorage,
      leafletData,
      BasemapService,
      OverlayService,
      leafletMapEvents,
      sessionService,
      loginService
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
        /*
        legend: {
          url: "http://103.7.52.65:6080/arcgis/rest/services/16dset_alokasi_ruang_laut/Kabupaten_Batu_Bara_RZWP3K/MapServer/legend?f=pjson",
          legendClass: "legend",
          position: "left"
        },*/
        markers: {},
        events: {
          map: {
            enable: ['context', 'click', 'dblclick'],
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
      $http.get("./assets/localStorage/alokasi_ruang_batang.geojson")
        .success(function(data) {
          localStorage.setObject('zona', data);
        });

      $scope.geojsonzone = localStorage.getObject('zona');

      $scope.activateLegend = false;
      $scope.showLegend = function() {
        $scope.activateLegend = !$scope.activateLegend;
        if ($scope.activateLegend) {
          $scope.legend = {
            position: 'topright',
            colors:
            [
              "#ff0000" ,
              "#ff00e1" ,
              "#e59f7e" ,
              "#f02e3e" ,
              "#bed319" ,
              "#3fdaae" ,
              "#0e6dd2" ,
              "#7fc93a" ,
              "#e3ad25" ,
              "#6add8e" ,
              "#9376cf" ,
              "#42de34" ,
              "#eb84df"
            ],
            labels:
            [
              'SZ Budidaya Laut',
              'SZ Penangkapan Ikan IA (0-2 mil)',
              'SZ Penangkapan Ikan IB (2-4 mil)',
              'SZ Penunjang Kawasan Peruntukan Industri',
              'SZ Lindung Karang Maeso(ZIKM)',
              'SZ Penyangga Zona Inti (ZTPI)',
              'SZ Pelabuhan Niaga',
              'SZ Rehabilitasi Hutan Pantai',
              'SZ Rehabilitasi Mangrove (ZTRM)',
              'SZ Rehabilitasi Mangrove(ZRTM)',
              'SZ Situs Budaya',
              'SZ Wisata Bahari',
              'Zona Lainnya (ZL-A)'
            ]
          };
        } else {
          $scope.legend = null;
        }
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
        console.log($scope.map.layers.overlays[key])
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


      $scope.isOverlap = function(lat, long) {
        //angular.forEach($scope.overlaidLayers, function(value, key) {
        leafletData.getMap().then(function(map) {
          var embuh = $scope.overlaidLayers['banggai'];
          console.log(embuh.url);

        });
        //});
      };


      // set the map properties based on position
      $scope.setMap = function(lat, long) {
        $scope.isOverlap(lat, long);
        $scope.$on('leafletDirectiveMap.contextmenu', function(event, args) {
          var leafEvent = args.leafletEvent;
          $scope.eventDetected = 'true';
          angular.extend($scope.map.markers, {
            pop: {
              lat: leafEvent.latlng.lat,
              lng: leafEvent.latlng.lng,
              focus: false,
              label: {
                message: leafEvent.latlng.lat.toFixed(3) + '; ' + leafEvent.latlng.lng.toFixed(3),
                options: {
                  noHide: true,
                  direction: 'auto'
                },
                icon: {
                  iconUrl: './assets/pin.png',
                  color: '#00f',
                  size: "l",
                  iconAnchor: [10, 10],
                  labelAnchor: [0, 8]
                }
              }

            }
          });
          console.log($scope.map.markers)
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
        };


      };
      try {
        $scope.isLogin = sessionService.isLogin();
        $scope.data = sessionService.get('currentSession');
      } catch (er) {
        $scope.isLogin = false;
      }
      $scope.toggleLogin = function() {
        //console.log("is watching location", $scope.isWatching);
        if (!$scope.isLogin) {
          // An elaborate, custom popup
          $scope.data = {};
          var myPopup = $ionicPopup.show({
            template: '<input type="email" placeholder="email" ng-model="data.email"><input type="password" placeholder="password" ng-model="data.pass">',
            title: 'Login',
            subTitle: 'Masukkan akun smartsea anda',
            scope: $scope,
            buttons: [
              { text: 'Login',
                type: 'button-positive',
                onTap: function(e) {
                  loginService.login($scope.data);
                }
              },
              {
                text: '<b>Daftar</b>',
                onTap: function(e) {
                  $state.go('app.daftar');
                }
              }
            ]})
        } else {
          var myPopup = $ionicPopup.show({
            title: 'Apakah anda ingin Log out?',
            scope: $scope,
            buttons: [
              { text: 'Ya',
                type: 'button-positive',
                onTap: function(e) {
                  // e.preventDefault();
                  sessionService.remove('currentSession');
                  $state.go('app.map');
                }
              },
              {
                text: '<b>Tidak</b>',
                onTap: function(e) {
                }
              }
            ]})
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


//Pengaturan
      $scope.notifZonaOn=false;
      $scope.toggleNotifZona=function() {
        if($scope.notifZonaOn){
          $scope.notifZonaOn=false;
        }
        else{
          $scope.notifZonaOn=true;
        }
      }

      $scope.getarZonaOn=false;
      $scope.toggleGetarZona=function() {
        if($scope.getarZonaOn){
          $scope.getarZonaOn=false;
        }
        else{
          $scope.getarZonaOn=true;
        }
      }

      $scope.infoDown=false;
      $scope.toggleInfo=function() {
        if($scope.infoDown){
          $scope.infoDown=false;
        }
        else{
          $scope.infoDown=true;
        }
      }

      $scope.getarInfoOn=false;
      $scope.toggleGetarInfo=function() {
        if($scope.getarInfoOn){
          $scope.getarInfoOn=false;
        }
        else{
          $scope.getarInfoOn=true;
        }
      }

      $scope.infoStateOn=false;
      $scope.munculOn=function() {
        $scope.infoStateOn=false;
      }
      $scope.munculOff=function() {
        $scope.infoStateOn=true;
      }

// Popup Laporkan
      $scope.lapor = function() {
        $ionicPopup.show({
            templateUrl: 'templates/lapor.html',
            scope: $scope,
            buttons: [
              { text: '<b>Batal</b>',
                onTap: function(e) {
                }
              },
              {
                text: 'Kirim',
                type: 'button-positive',
                onTap: function(e) {
                }
              }
            ]})
      }

// Popup tambah
$scope.tambah = function() {
        $ionicPopup.show({
            templateUrl: 'templates/tambah.html',
            scope: $scope,
            buttons: [
              { text: '<b>Batal</b>',
                onTap: function(e) {
                }
              },
              {
                text: 'Tambah',
                type: 'button-positive',
                onTap: function(e) {
                }
              }
            ]})
      }

// Side menu
      $scope.layerInfo1 = false;
      $scope.layerInfo2 = false;
      $scope.toggleLayerInfo1 = function() {
        if ($scope.layerInfo1) {
          $scope.layerInfo1 = false;
        }
        else {
          $scope.layerInfo1 = true;
        }
      }
      $scope.toggleLayerInfo2 = function() {
        if ($scope.layerInfo2) {
          $scope.layerInfo2 = false;
        }
        else {
          $scope.layerInfo2 = true;
        }
      }
    }
  ]);
