angular.module('starter').factory('OverlayOnlineService', [function($scope, $http) {

  var overlayObj = {};
  overlayObj.savedLayers = {
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
