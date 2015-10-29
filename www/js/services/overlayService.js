angular.module('starter').factory('OverlayService', [function() {


  var overlayObj = {};

  overlayObj.savedLayers = {
    batasdesa: {
      name: 'batasdesa',
      text: 'Batas Desa Sleman',
      checked: true,
      type: 'wms',
      url: 'http://175.111.91.247:8080/geoserver/smartsea/wms',
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
    desa_yogya: {
      name: "desa_yogya",
      text: 'Yogyakarta',
      type: "agsFeature",
      url: "http://services5.arcgis.com/1aoscVxKFl7ZOgla/arcgis/rest/services/Batas_Administrasi_Yogyakarta/",
      visible: true,
      checked: false,
      layerOptions:{
        useCors: true
      },
      layerParams: {
        showOnSelector: false
      }
    },
    batasdesa_yogya: {
      name: 'batasdesa_yogya',
      text: 'Desa Yogyakarta WFS',
      checked: false,
      type: 'wfs',
      url: 'http://175.111.91.247:8080/geoserver/smartsea/ows?service=WFS',
      visible: true,
      layer: 'smartsea:rencanapolaruang',
      layerOptions: {
        useCors:true,
        crs: 'EPSG:32749',
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        //typeName: 'smartsea:administrasi_desa',
        outputFormat: 'text/javascript',
        format_options: 'callback: getJson'
      },
      layerParams: {
        showOnSelector: false
      }
    },
    /*
    klorofil: {
      name: 'klorofil',
      text: 'Liputan Klorofil',
      checked: false,
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
    },*/
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
