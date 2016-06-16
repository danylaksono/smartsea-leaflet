angular.module('starter').controller('daftarController',
  [ '$scope',
    '$state',
    '$stateParams',
    '$ionicPopup',
    'getProfileService',
   function($scope, $state, $stateParams, $ionicPopup, getProfileService) {
   	$scope.isValid = {user:true,pass:true,all:true};
   	$scope.cekUser=function() {
		if($scope.data.namaPengguna.indexOf(" ")>0) {
			$scope.isValid.user=false;
			$scope.isValid.all=!($scope.isValid.user&&$scope.isValid.pass);
		}
		else {
			$scope.isValid.user=true;
			$scope.isValid.all=!($scope.isValid.user&&$scope.isValid.pass);
		}
   	}
   	$scope.cekPassw=function() {
   		if($scope.data.password==$scope.data.confirmPass) {
   			$scope.isValid.pass=true;	
   			$scope.isValid.all=!($scope.isValid.user&&$scope.isValid.pass);
   		}
   		else {
   			$scope.isValid.pass=false;
   			$scope.isValid.all=!($scope.isValid.user&&$scope.isValid.pass);
   		}
   	}

    var data = $scope.data;

    var isNewUser = function(uid) {
      var check;
      var ref = new Firebase("https://smartseadevelop.firebaseio.com");
      ref.once("value", function(snapshot) {
        var check = snapshot.child('users').child(uid).exists();
      });      
      return !check;
    }

    var writeData = function(uid) {
      if(isNewUser(uid)) {
        var ref = new Firebase("https://smartseadevelop.firebaseio.com");
        if (isNewUser) {
          // save the user's profile into the database so we can list users,
          // use them in Security and Firebase Rules, and show profiles
          ref.child("users").child(uid).set({
            nameLengkap: data.namaLengkap,
            noHp: data.noHp,
            email: data.email,
            ukuranKapal: data.ukuranKapal,
            namaPengguna: data.namaPengguna,
            currentAva: "assets/img/profile.png"
          });
          getProfileService.get(uid);
          setTimeout(function() {$state.go('app.profil')}, 1000);
          console.log("create user success:", uid);
        }
      }
    }

	   $scope.daftar=function() {
      var ref = new Firebase("https://smartseadevelop.firebaseio.com/");
      ref.createUser({
        email    : $scope.data.email,
        password : $scope.data.password
      }, function(error, userData) {
        if (error) {
          alert(error)
          console.log("Error creating user:", error);
        } else {
          writeData(userData.uid);
        }
      });
	   }
    }
  ]
)