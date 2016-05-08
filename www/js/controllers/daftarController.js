angular.module('starter').controller('daftarController',
  [ '$scope',
    '$state',
    '$stateParams',
   function($scope, $state, $stateParams) {
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
	   $scope.daftar=function() {
	   }
    }
  ]
)