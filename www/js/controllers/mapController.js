angular.module('starter').controller('MapController', ['$scope',
  '$cordovaGeolocation',
  '$stateParams',
  '$ionicModal',
  '$ionicPopup',
  'LocationsService',
  'InstructionsService',
  function(
    $scope,
    $cordovaGeolocation,
    $stateParams,
    $ionicModal,
    $ionicPopup,
    LocationsService,
    InstructionsService

  ) {

    /*
    predefine layers
    */

    $scope.basemapLayers = {
      osm: {
        name: 'OpenStreetMap',
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        type: 'xyz'
      },
      mapbox_light: {
        name: 'Mapbox Light',
        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
        type: 'xyz',
        layerOptions: {
          apikey: 'pk.eyJ1IjoiYnVmYW51dm9scyIsImEiOiJLSURpX0pnIn0.2_9NrLz1U9bpwMQBhVk97Q',
          mapid: 'bufanuvols.lia22g09'
        }
      },
      cycle: {
        name: "OpenCycleMap",
        type: "xyz",
        url: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
        layerOptions: {
          subdomains: ["a", "b", "c"],
          attribution: "&copy; <a href=\"http://www.opencyclemap.org/copyright\">OpenCycleMap</a> contributors - &copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors",
          continuousWorld: true
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
          opacity: 0.25
        }
      },
      pola_ruang: {
        name: 'Pola Ruang',
        type: 'wms',
        url: 'http://10.40.109.50:8080/geoserver/smartsea/wms',
        visible: true,
        version: '1.1.0',
        layerOptions: {
          layers: 'smartsea:pola_ruang',
          format: 'image/png',
          crs: L.CRS.EPSG4326,
          opacity: 0.25
        }
      }
    };

    // Initial Map Settings
    $scope.map = {
      layers: {
        baselayers: {
          osm: $scope.basemapLayers.osm
        }
      },
      markers: {},
      events: {
        map: {
          enable: ['context'],
          logic: 'emit'
        }
      },
      center : {
        autoDiscover: true,
        zoom: 12
      }
    };

    $scope.$on("$stateChangeSuccess", function() {
      console.log('state changed');
      //$scope.locateStatic();
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
          timeout : 3000,
          enableHighAccuracy: false // may cause errors if true
        };

        var watch = $cordovaGeolocation.watchPosition(watchOptions);
        watch.then(
          null,
          function(err) {
            console.log("Location error!");
            console.log(err);
          },
          function(position) {
            $scope.map.center.lat = position.coords.latitude;
            $scope.map.center.lng = position.coords.longitude;
            $scope.map.center.zoom = 15;

            $scope.map.markers.now = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              message: $scope.map.center.lat + "; " +$scope.map.center.lng,
              focus: true,
              draggable: false
            };
          }
        );
      };



    //TODO:masukkan fungsi provider layers dalam service tersendiri
    $scope.devList = [{
      text: "Layer UGM",
      checked: true
    }, {
      text: "Layer 2",
      checked: false
    }, {
      text: "Layer 3",
      checked: false
    }];

    $scope.showAlert = function() {
      var alertPopup = $ionicPopup.alert({
        title: 'Unduh Data',
        template: 'Download data yang anda inginkan'
      });
      alertPopup.then(function(res) {
        console.log('Thank you for not eating my delicious ice cream cone');
      });
    };


    /*
    TODO:
      $ fungsi untuk ambil atribut geojson berdasarkan posisi
          - openlayers containspoint
          - WPS as geojson
      $ fungsi untuk cek koneksi internet
      $ fungsi untuk memilih grid, download data berdasarkan grid tsb



    */



  }
]);
