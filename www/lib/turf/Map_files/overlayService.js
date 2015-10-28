angular.module('starter').factory('OverlayService', ["$http",function($http) {


  /*
  var url= "http://localhost:8080/geoserver/smartsea/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=smartsea:administrasi_desa&outputformat=application/json"
  $http.get(url).success(function(data, status) {
    console.log("status", status);
    console.log("data", data);
  });
  */



  var overlayObj = {};
  overlayObj.savedLayers = {
    batasdesa: {
      name: 'Batas Desa Sleman',
      text: 'batasdesa',
      checked: true,
      type: 'wms',
      url: 'http://localhost:8080/geoserver/smartsea/wms',
      visible: true,
      version: '1.1.0',
      layerOptions: {
        layers: 'smartsea:Batas_Desa',
        format: 'image/png',
        crs: L.CRS.EPSG32749,
        opacity: 0.5
      },
      layerParams: {
        showOnSelector: false
      }
    },
    batasdesa3: {
      name: 'Desa Yogyakarta WFS',
      text: 'yogyakarta_wfs',
      checked: true,
      type: 'wfs',
      layer: 'smartsea:administrasi_desa',
      url: 'http://localhost:8080/geoserver/smartsea/ows',
      visible: true,
      options: {
        crs: L.CRS.EPSG32749
      },
      layerParams: {
        showOnSelector: false
      }
    }
  };


  return overlayObj;

}]);
