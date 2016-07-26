angular.module('starter').factory('DownloadService', [function($scope, $http) {

  var downloadObj = {};

  downloadObj.downloadLayers = {
    banggaikepulauan: {
      layername: 'Banggai Kepulauan',
      url: "http://103.7.52.65:6080/arcgis/rest/services/smartsea/bangkep/FeatureServer/0/",
      type: 'FeatureServer'
    },
    banggai: {
      layername: 'Banggai',
      url:  'http://103.7.52.65:6080/arcgis/rest/services/smartsea/Alokasi_Ruang_Kab_Banggai_Poligon/MapServer/0/',
      type: 'MapServer'
    }
  };


  return downloadObj;

}]);
