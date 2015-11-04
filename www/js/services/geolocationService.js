angular.module('starter').factory('GeolocationService',
  function() {

    var geolocationData = {};

    return {
      getLocationData: function(){
        return getLocationData;
      },
      setLocationData: function(data){
        getLocationData.push(data);
    }
  };

  });
