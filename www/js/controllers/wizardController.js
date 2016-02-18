angular.module('starter').controller('WizardController',
  [ '$scope',
    '$state',
    '$stateParams',
   function($scope, $state, $stateParams) {

  $scope.$on('onlinewith', function(event, networkState) {
       $scope.onlineState = networkState;
       console.log($scope.onlineState);
  })

}])
