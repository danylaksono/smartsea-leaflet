angular.module('starter').factory('OverlayService', [function($scope, $http) {


  var overlayObj = {};
  overlayObj.savedLayers = {
    batasdesa: {
      name: 'batasdesa',
      text: 'Desa Sleman (Geos)',
      checked: true,
      disabled: true,
      online: true,
      type: 'wms',
      url: 'http://175.111.91.247:8080/geoserver/smartsea/wms',
      visible: true,
      version: '1.1.0',
      layerOptions: {
        layers: 'smartsea:Batas_Desa',
        crs: L.CRS.EPSG32749,
        opacity: 0.5
      },
      layerParams: {
        showOnSelector: false
      }
    }

  };

  return overlayObj;

}]);
