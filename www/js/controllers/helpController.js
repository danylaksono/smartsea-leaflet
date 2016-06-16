angular.module('starter').controller('HelpController',
  [ '$scope',
    '$state',
    '$stateParams',
    '$ionicPopup',
    'sessionService',
    'loginService',
   function($scope, $state, $stateParams,loginService,sessionService,$ionicPopup) {
   	try {
        $scope.isLogin = sessionService.isLogin();
        $scope.data = sessionService.get('currentSession');
      } catch (er) {
        $scope.isLogin = false;
      }
      $scope.toggleLogin = function() {
        //console.log("is watching location", $scope.isWatching);
        if (!$scope.isLogin) {
          // An elaborate, custom popup
          $scope.data = {};
          var myPopup = $ionicPopup.show({
            template: '<input type="email" placeholder="email" ng-model="data.email"><input type="password" placeholder="password" ng-model="data.pass">',
            title: 'Login',
            subTitle: 'Masukkan akun smartsea anda',
            scope: $scope,
            buttons: [
              { text: 'Login',
                type: 'button-positive',
                onTap: function(e) {
                  loginService.login($scope.data);
                }
              },
              {
                text: '<b>Daftar</b>',
                onTap: function(e) {
                  $state.go('app.daftar');
                }
              }
            ]})
        } else {
          var myPopup = $ionicPopup.show({
            title: 'Apakah anda ingin Log out?',
            scope: $scope,
            buttons: [
              { text: 'Ya',
                type: 'button-positive',
                onTap: function(e) {
                  e.preventDefault();
                  sessionService.remove('currentSession');
                }
              },
              {
                text: '<b>Tidak</b>',
                onTap: function(e) {
                }
              }
            ]})
        }
      };
}])
