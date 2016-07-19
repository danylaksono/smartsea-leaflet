angular.module('starter').factory('DownloadService', [function($scope, $http) {

  var downloadObj = {};

  downloadObj.savedLayers = {
    batasmaritim: {
      layername: 'Banggai Kepulauan',
      url:  'http://103.7.52.65:6080/arcgis/rest/services/smartsea/bangkep/FeatureServer/0/',
      type: 'FeatureServer'
    }
  };


  return downloadObj;

}]);
