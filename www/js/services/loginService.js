angular.module('starter')
  .factory('loginService', function(
    $state,
    getProfileService,
    $ionicLoading
  ) {
    // firebase app name
    var ref = new Firebase('https://smartseadevelop.firebaseio.com/');
    return {
      login: function(data) {
        $ionicLoading.show({
          template: 'Loading...'
        })
        ref.authWithPassword({
          email: data.email,
          password: data.pass
        }, function(error, authData) {
          if (error) {
            $ionicLoading.hide()
            console.log("Login Failed!", error);
          } else {
            console.log("Authenticated successfully with payload:", authData);
            getProfileService.get(authData.uid);
            setTimeout(function() {
              location.reload();
              $state.go('app.profil')
            }, 1000)
          }
        })
      }
    };
  });