angular.module('starter').factory('BasemapService', [ function() {

  var basemapsObj = {};

  basemapsObj.savedLayers = {
    /*osm: {
      name: 'OpenStreetMap',
      url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      type: 'xyz',
      visible: true,
      layerParams: {
        showOnSelector: false
      }
    }, */
    surfer: {
      name: "OpenMapSurfer",
      type: "xyz",
      url: "http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}",
      visible: true,
      layerOptions: {
        attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 20
      },
      layerParams: {
        showOnSelector: false
      }
    }
  };

  return basemapsObj;

}]);
