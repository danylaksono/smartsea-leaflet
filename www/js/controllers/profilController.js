angular.module('starter').controller('ProfilController',
   function($scope, $state, sessionService, $ionicLoading) {
   	var data = sessionService.get('currentSession');
   	$ionicLoading.hide()
   	$scope.ava = "assets/img/profile.png";
   	$scope.namaLengkap = data.nameLengkap;
   	$scope.noHp = data.noHp;
   	$scope.email = data.email;
   	$scope.email = data.email;
   	$scope.ukuranKapal = data.ukuranKapal;
})
