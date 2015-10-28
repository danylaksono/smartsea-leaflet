angular.module('starter').factory('OverlayService', [function($scope) {

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
        opacity: 0.5,
        style: {
          color: '#00D',
          fillColor: 'red',
          weight: 2.0,
          opacity: 0.6,
          fillOpacity: 0.2
        }
      },
      layerParams: {
        showOnSelector: false
      }
    }
  };

  return overlayObj;

}]);
