angular.module('starter').factory('BasemapService', [function() {

  var basemapsObj = {};

  basemapsObj.savedLayers = {
    osm: {
      name: 'OpenStreetMap',
      url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      type: 'xyz',
      visible: true,
      layerParams: {
        showOnSelector: false
      }
    },
    topo: {
      name: "World Topographic",
      type: "agsBase",
      layer: "Topographic",
      visible: false,
      layerParams: {
        showOnSelector: false
      }
    },
    national: {
      name: "National Geographic",
      type: "agsBase",
      layer: "NationalGeographic",
      visible: false,
      layerParams: {
        showOnSelector: false
      }
    },
    oceans: {
      name: "Oceans",
      type: "agsBase",
      layer: "Oceans",
      visible: false,
      layerParams: {
        showOnSelector: false
      }
    },
  };

  return basemapsObj;

}]);
