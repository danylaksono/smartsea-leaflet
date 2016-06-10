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
    },
    batang: {
      name: 'Kab. Batang',
      text: 'RZWP Batang',
      checked: true,
      disabled: false,
      type: 'agsDynamic',
      url: 'http://103.7.52.65:6080/arcgis/rest/services/16dset_alokasi_ruang_laut/Kabupaten_Batang_RZWP3K/MapServer',
      visible: true,
      layerOptions: {
        crs: L.CRS.EPSG4326,
        opacity: 1
      },
      layerParams: {
        showOnSelector: true
      }
    },
    banten: {
      name: 'Provinsi. Banten',
      text: 'RZWP Banten',
      checked: true,
      disabled: false,
      type: 'agsDynamic',
      url: 'http://103.7.52.65:6080/arcgis/rest/services/16dset_alokasi_ruang_laut/Provinsi_Banten_RZWP3K/MapServer',
      visible: true,
      layerOptions: {
        crs: L.CRS.EPSG32748,
        opacity: 1
      },
      layerParams: {
        showOnSelector: true
      }
    }

  };


  return overlayObj;

}]);
