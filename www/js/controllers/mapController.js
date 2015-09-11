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

    /**
     * Once state loaded, get put map on scope.
     */
    $scope.$on("$stateChangeSuccess", function() {
      console.log('succeed in changing status');
      $scope.locations = LocationsService.savedLocations;
      $scope.newLocation;

      if (!InstructionsService.instructions.newLocations.seen) {

        var instructionsPopup = $ionicPopup.alert({
          title: 'Tambahkan Layer',
          template: InstructionsService.instructions.newLocations.text
        });
        instructionsPopup.then(function(res) {
          InstructionsService.instructions.newLocations.seen = true;
        });

      }


      $scope.map = {
        defaults: {
          tileLayer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          maxZoom: 18,
          zoomControlPosition: 'topright'
        },
        markers: {},
        events: {
          map: {
            enable: ['context'],
            logic: 'emit'
          }
        }
      };

      $scope.goTo(0);
      $scope.locate();

    });

    var Location = function() {
      if (!(this instanceof Location)) return new Location();
      this.lat = "";
      this.lng = "";
      this.name = "";
    };

    $ionicModal.fromTemplateUrl('templates/addLocation.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    /**
     * Detect user long-pressing on map to add new location
     */
    $scope.$on('leafletDirectiveMap.contextmenu', function(event, locationEvent) {
      $scope.newLocation = new Location();
      $scope.newLocation.lat = locationEvent.leafletEvent.latlng.lat;
      $scope.newLocation.lng = locationEvent.leafletEvent.latlng.lng;
      $scope.modal.show();
    });

    $scope.saveLocation = function() {
      LocationsService.savedLocations.push($scope.newLocation);
      $scope.modal.hide();
      $scope.goTo(LocationsService.savedLocations.length - 1);
    };

    /**
     * Center map on specific saved location
     * @param locationKey
     */
    $scope.goTo = function(locationKey) {

      var location = LocationsService.savedLocations[locationKey];

      $scope.map.center = {
        lat: location.lat,
        lng: location.lng,
        zoom: 12
      };

      $scope.map.markers[locationKey] = {
        lat: location.lat,
        lng: location.lng,
        message: location.name,
        focus: true,
        draggable: false
      };

    };

    /**
     * Center map on user's current position
     */
    $scope.locate = function() {
      var geoSettings = {
        frequency: 1000,
        timeout: 30000,
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
          message: "Anda Di Sini",
          focus: true,
          draggable: false
        };

      }, function(err) {
        // error
        console.log("Location error!");
        console.log(err);
      });


      /*
                  $cordovaGeolocation
                  .getCurrentPosition()
                  .then(function(position) {
                    $scope.map.center.lat = position.coords.latitude;
                    $scope.map.center.lng = position.coords.longitude;
                    $scope.map.center.zoom = 15;

                    $scope.map.markers.now = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                      message: "Anda Di Sini",
                      focus: true,
                      draggable: false
                    };

                  }, function(err) {
                    // error
                    console.log("Location error!");
                    console.log(err);
                  });

      */


    };

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


/*

    overlays: {
                       wms: {
                           name: 'EEUU States (WMS)',
                           type: 'wms',
                           visible: true,
                           url: 'http://suite.opengeo.org/geoserver/usa/wms',
                           layerParams: {
                               layers: 'usa:states',
                               format: 'image/png',
                               transparent: true
                           }
                         }
                       }
*/









  }
]);
