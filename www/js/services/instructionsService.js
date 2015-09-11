angular.module('starter').factory('InstructionsService', [ function() {

  var instructionsObj = {};

  instructionsObj.instructions = {
    newLocations : {
      text : 'Klik menu untuk mengaktifkan layer',
      seen : false
    }
  };

  return instructionsObj;

}]);
