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


/*
$scope.toMap = function() {
  var confirmPopup = $ionicPopup.confirm({
    title: 'Consume Ice Cream',
    template: 'Are you sure you want to eat this ice cream?'
  });
};
*/
