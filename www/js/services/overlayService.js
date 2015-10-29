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
    }, /*
    batasdesa3: {
      name: 'Desa Yogyakarta WFS',
      text: 'yogyakarta_wfs',
      checked: false,
      type: 'wfs',
      layer: 'smartsea:administrasi_desa',
      url: 'http://localhost:8080/geoserver/smartsea/ows',
      visible: true,
      layerOptions: {
        crs: L.CRS.EPSG32749
      },
      layerParams: {
        showOnSelector: false
      }
    }, */
    klorofil: {
      name: 'Liputan Klorofil',
      text: 'klorofil',
      checked: false,
      type: 'xyz',
      url: 'http://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_Chlorophyll_A/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}',
      opacity: 0.75,
      layerOptions: {
        attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
      },
      layerParams: {
        showOnSelector: false
      }
    },
    fire: {
      name: 'OpenFireMap',
      type: 'xyz',
      url: 'http://openfiremap.org/hytiles/{z}/{x}/{y}.png',
      layerOptions: {
        attribution: '&copy; <a href="http://www.openfiremap.org">OpenFireMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        continuousWorld: true
      },
      layerParams: {
        showOnSelector: false
      }
    },
    awan: {
      name: 'Liputan Awan',
      type: 'xyz',
      text: 'owm_awan',
      checked: false,
      url: 'http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png',
      layerOptions: {
        opacity: 0.5,
        attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>'
      },
      layerParams: {
        showOnSelector: false
      }
    }
  };


  return overlayObj;

}]);
