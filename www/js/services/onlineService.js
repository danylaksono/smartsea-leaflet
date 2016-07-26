angular.module('starter').factory('OnlineService', [function($scope, $http) {

  var overlayObj = {};
  overlayObj.onlineLayers = {
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
        showOnSelector: false
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
        showOnSelector: false
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
        showOnSelector: false
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
        showOnSelector: false
      }
    },
    konservasi: {
      name: 'Kawasan konservasi Perairan',
      text: 'Kawasan konservasi Perairan',
      checked: true,
      disabled: false,
      type: 'agsDynamic',
      url: 'http://103.7.52.65:6080/arcgis/rest/services/16dset_alokasi_ruang_laut/Kawasan_Konservasi_Perairan_/MapServer',
      visible: true,
      layerOptions: {
        crs: L.CRS.EPSG32748,
        opacity: 1
      },
      layerParams: {
        showOnSelector: false
      }
    },
    polaRuang: {
      name: 'Rencana Pola Ruang Laut Nasional',
      text: 'Rencana Pola Ruang Laut Nasional',
      checked: true,
      disabled: false,
      type: 'agsDynamic',
      url: 'http://103.7.52.65:6080/arcgis/rest/services/16dset_alokasi_ruang_laut/Rencana_Pola_Ruang_Laut_Nasional/MapServer',
      visible: true,
      layerOptions: {
        crs: L.CRS.EPSG32748,
        opacity: 1
      },
      layerParams: {
        showOnSelector: false
      }
    }

  };

  return overlayObj;

}]);
