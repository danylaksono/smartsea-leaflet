angular.module('starter').factory('geoLocation', function($localStorage) {
  return {
    setGeolocation: function(latitude, longitude, heading, speed, accuracy) {
      var _position = {
        latitude: latitude,
        longitude: longitude,
        heading: heading,
        speed: speed,
        accuracy: accuracy
      }
      $localStorage.setObject('geoLocation', _position)
    },
    getGeolocation: function() {
      return glocation = {
        lat: $localStorage.getObject('geoLocation').latitude,
        lng: $localStorage.getObject('geoLocation').longitude,
        head: $localStorage.getObject('geoLocation').heading,
        speed: $localStorage.getObject('geoLocation').speed,
        acc: $localStorage.getObject('geoLocation').accuracy
      }
    }
  }
})
