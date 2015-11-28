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
    },
    batasdesa_yogya: {
      name: 'batasdesa_yogya',
      text: 'Desa Yogyakarta (Geos)',
      checked: false,
      type: 'wfs',
      url: 'http://175.111.91.247:8080/geoserver/smartsea/wfs',
      visible: true,
      layer: 'smartsea:Batas_Desa',
      layerOptions: {
        //useCors:true,
        srsName: 'EPSG:32749',
        outputFormat: 'application/json',
        service: 'WFS',
        //version: '1.0.0',
        request: 'GetFeature',
        //typeName: 'smartsea:Batas_Desa'
        //outputFormat: 'text/javascript',
        //format_options: 'callback: getJson'
      },
      layerParams: {
        showOnSelector: false
      }
    },
    desa_yogya: {
      name: "desa_yogya",
      text: 'Yogyakarta (ArcGIS)',
      type: "agsFeature",
      url: "http://175.111.91.247:6080/arcgis/rest/services/smartsea/pg_batas_desa/FeatureServer/0",
      visible: true,
      checked: false,
      layerOptions:{
        useCors: true
      },
      layerParams: {
        showOnSelector: false
      }
    },

    liputanawan: {
      name: 'liputanawan',
      text: 'Liputan Awan',
      checked: false,
      visible: true,
      type: 'xyz',
      url: 'http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png',
      layerOptions: {
        maxZoom: 19,
        opacity: 0.5
          //attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>'
      },
      layerParams: {
        showOnSelector: false
      }
    }

  };

  return overlayObj;

}]);
