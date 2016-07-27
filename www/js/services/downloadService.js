angular.module('starter').factory('DownloadService', ['$q', '$http', function($q, $http) {

  /*
  var downloadObj = {};
  downloadObj.downloadLayers = {
    banggaikepulauan: {
      name: 'Banggai Kepulauan',
      filename: 'banggaikepulauan',
      url: "http://103.7.52.65:6080/arcgis/rest/services/smartsea/bangkep/FeatureServer/0/",
      type: 'FeatureServer'
    },
    banggai: {
      name: 'Banggai',
      filename: 'banggai',
      url: 'http://103.7.52.65:6080/arcgis/rest/services/smartsea/Alokasi_Ruang_Kab_Banggai_Poligon/MapServer/0/',
      type: 'MapServer'
    }
  };


  return downloadObj;
*/


  return {
    getData: function() {
      var services = {
        type: 'services',
        url: "http://103.7.52.65:6080/arcgis/rest/services/",
        folder: 'smartsea/',
        layers: []
      };

      return $http.get(services.url+ services.folder + '?f=pjson')
        .then(function(response) {
          angular.forEach(response.data.services, function(value, key) {
            //console.log(value);
            services.layers.push(value);
          });
          return services;
        });


    }
  }


}]);
