angular.module('starter').controller('HomeController',
  [ '$scope',
    '$state',
    '$stateParams',
   function($scope, $state, $stateParams) {
   $scope.toMap = function() {
     $state.go('app.map');
     console.log('here');
   };

}])
