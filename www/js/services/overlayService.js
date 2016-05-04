angular.module('starter').factory('OverlayService', ['$http', function($http) {


  var overlayObj = {};

  overlayObj.savedLayers = {
    banggai: {
      name: 'Kab. Banggai',
      text: 'RZWP Banggai',
      checked: true,
      disabled: false,
      type: 'agsDynamic',
      url: 'http://103.7.52.65:6080/arcgis/rest/services/16dset_alokasi_ruang_laut/Kabupaten_Banggai_RZWP3K/MapServer',
      visible: true,
      layerOptions: {
        crs: L.CRS.EPSG32751,
        opacity: 1
      },
      layerParams: {
        showOnSelector: true
      }
    },
    batubara: {
      name: 'Kab. Batubara',
      text: 'RZWP RTRW Banggai',
      checked: true,
      disabled: false,
      type: 'agsDynamic',
      url: 'http://103.7.52.65:6080/arcgis/rest/services/16dset_alokasi_ruang_laut/Kabupaten_Batu_Bara_RZWP3K/MapServer',
      visible: true,
      layerOptions: {
        crs: L.CRS.EPSG32647,
        opacity: 1
      },
      layerParams: {
        showOnSelector: true
      }
    }

  };


  return overlayObj;

}]);
