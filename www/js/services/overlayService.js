angular.module('starter').factory('OverlayService', ['$http', function($http) {

  var localLayers = {};

  localLayers.savedLayers = {
    batasmaritim: {
      layername: 'Batas Maritim Penangkapan Ikan',
      filename:  'batas_maritim_penangkapan_ikan.geojson',
      color: '#7C3516',
      type: 'local'
    },
    zee: {
      layername: 'Batas ZEE',
      filename: 'batas_zee.geojson',
      color: '#FE0101',
      type: 'local'
    },
    zonatambahan: {
      layername: 'Batas Zona Tambahan',
      filename: 'batas_zona_tambahan.geojson',
      color: '#5601FE',
      type: 'local'
    },
    garispangkal: {
      layername: 'Garis Pangkal',
      filename: 'garis_pangkal.geojson',
      color: '#2CFE01',
      type: 'local'
    },
    indonesia: {
      layername: 'Batas Kepulauan indonesia',
      filename: 'indonesia.geojson',
      color: '#01B2FE',
      type: 'local'
    },
    landaskontinen: {
      layername: 'Landas Kontinen 200 mi',
      filename: 'landas_kontinen_200mi.geojson',
      color: '#FEFE01',
      type: 'local'
    },
    lautteritorial: {
      layername: 'Laut Teritorial' ,
      filename: 'laut_teritorial.geojson',
      color: '#01FEC3',
      type: 'local'
    }
  };

  return localLayers;

}]);
