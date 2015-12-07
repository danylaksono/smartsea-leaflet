angular.module('starter').factory('OverlayService', [function($scope, $http) {


  var overlayObj = {};
  //overlayObj.localLayers = {};
  overlayObj.savedLayers = {
    batasdesa: {
      name: 'batasdesa',
      text: 'Batas Administrasi',
      checked: true,
      disabled: true,
      online: true,
      type: 'wms',
      url: 'http://175.111.91.247:8001/geoserver/geonode/wms',
      visible: true,
      version: '1.1.0',
      layerOptions: {
        layers: 'geonode:cjava_yogya_village_boundary_bako_june2004',
        crs: L.CRS.EPSG4326,
        opacity: 0.5
      },
      layerParams: {
        showOnSelector: false
      }
    },
    batassermo: {
      name: 'batassermo',
      text: 'Waduk Sermo',
      checked: false,
      disabled: true,
      online: true,
      type: 'wms',
      url: 'http://175.111.91.247:8001/geoserver/geonode/wms',
      visible: true,
      version: '1.1.0',
      layerOptions: {
        layers: 'geonode:batassermo',
        crs: L.CRS.EPSG32749,
        opacity: 0.5
      },
      layerParams: {
        showOnSelector: false
      }
    },
    tataruangsermo: {
      name: 'tataruangsermo',
      text: 'Tata Ruang Waduk Sermo',
      checked: false,
      disabled: true,
      online: true,
      type: 'wms',
      url: 'http://175.111.91.247:8001/geoserver/geonode/wms',
      visible: true,
      version: '1.1.0',
      layerOptions: {
        layers: 'geonode:layertataruanglaut',
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
