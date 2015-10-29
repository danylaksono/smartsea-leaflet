angular.module('starter').factory('OverlayService', [function() {


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
    batasdesa_yogya: {
      name: 'Desa Yogyakarta WFS',
      text: 'yogyakarta_wfs',
      checked: false,
      type: 'wfs',
      url: 'http://localhost:8080/geoserver/smartsea/ows',
      visible: true,
      layer: 'smartsea:administrasi_desa',
      layerOptions: {
        crs: L.CRS.EPSG32749
      },
      layerParams: {
        showOnSelector: false
      }
    },
    klorofil: {
      name: 'Liputan Klorofil',
      text: 'klorofil',
      checked: true,
      visible: true,
      type: 'xyz',
      url: 'http://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_Chlorophyll_A/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}',
      opacity: 0.75,
      layerOptions: {
        //attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
        minZoom: 1,
        maxZoom: 7,
        format: 'png',
        time: '',
        tilematrixset: 'GoogleMapsCompatible_Level',
        opacity: 0.75
      },
      layerParams: {
        showOnSelector: false
      }
    },
    liputanawan: {
      type: 'xyz',
      name: 'Liputan Awan',
      text: 'owm_awan',
      checked: true,
      visible: true,
      url: 'http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png',
      layerOptions: {
        maxZoom: 19
        //attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>'
      },
      layerParams: {
        showOnSelector: false
      }
    }

  };

  return overlayObj;

}]);
