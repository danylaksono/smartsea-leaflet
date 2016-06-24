angular.module('starter').controller('ProfilController',
   function($scope, $state, sessionService, $ionicLoading, $ionicPopup) {
   	var data = sessionService.get('currentSession');
   	$ionicLoading.hide()

   	$scope.ava = data.currentAva;
   	$scope.namaLengkap = data.nameLengkap;
   	$scope.noHp = data.noHp;
   	$scope.email = data.email;
   	$scope.email = data.email;
   	$scope.ukuranKapal = data.ukuranKapal;

   	$scope.ubahAva = function() {
   		$ionicPopup.show({
            title: 'Apakah anda ingin mengubah Avatar anda?',
            scope: $scope,
            buttons: [
              { text: 'Ya',
                type: 'button-positive',
                onTap: function(e) {
                	$state.go('app.ubahAva')
                }
              },
              {
                text: '<b>Tidak</b>',
                onTap: function(e) {
                }
              }
            ]})
   	}
})
