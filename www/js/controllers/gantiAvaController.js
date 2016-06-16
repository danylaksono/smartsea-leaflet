angular.module('starter').controller('gantiAvaController',
  [ '$scope',
    '$state',
    '$stateParams',
    'sessionService',
   function($scope, $state, $stateParams, sessionService) {
   	var data = sessionService.get('currentSession');
   	$scope.ava = data.currentAva;
   }
  ]
)