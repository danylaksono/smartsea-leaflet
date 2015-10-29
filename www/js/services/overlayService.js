angular.module('starter').factory('OverlayService', [function() {


  var overlayObj = {};

  overlayObj.savedLayers = {
    batasdesa: {
      name: 'batasdesa',
      text: 'Batas Desa Sleman',
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
    navigation: {
      text: "Pelabuhan",
      name: "navigation",
      type: "agsTiled",
      url: "http://gis.dephub.go.id/arcgis/rest/services/Laut/Pelabuhan/MapServer",
      visible: true,
      layerOptions:{
        useCors: true
      },
      layerParams: {
        showOnSelector: false
      }
    },
    desa_yogya: {
      name: "desa_yogya",
      text: 'Yogyakarta',
      type: "agsFeature",
      url: "http://services5.arcgis.com/1aoscVxKFl7ZOgla/arcgis/rest/services/Batas_Administrasi_Yogyakarta/FeatureServer/0",
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
      url: 'http://localhost:8080/geoserver/smartsea/ows?service=WFS',
      //url: 'http://localhost:8080/geoserver/wfs?srsName=EPSG:4326&typename=geonode:administrasi_desa&outputFormat=json&version=1.0.0&service=WFS&request=GetFeature',
      visible: true,
      layer: 'smartsea:administrasi_desa',
      layerOptions: {
        useCors:true,
        crs: 'EPSG:4326',
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        //typeName: 'smartsea:administrasi_desa',
        maxFeatures: 200,
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
