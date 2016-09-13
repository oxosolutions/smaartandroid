'use strict'

angular.module('smaart.controllers', ['ngCordova'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, localStorageService, $ionicLoading) {

    $scope.logout = function(){

      $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner>',
        noBackdrop: false
      });

      localStorageService.set('userDet','');
      $state.go('login');
      $ionicLoading.hide();
    }

    
}).controller('LoginCtrl', function($scope, $ionicLoading, localStorageService, $state, appData){

    $scope.data = {email:'', password: ''};
    $scope.doLogin = function(){

         $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              noBackdrop: false
            });
        var UserEmail = $scope.data.email.trim();
        var UserPass = $scope.data.password.trim();
        
        var errorStatus = false;
        
        if(UserEmail == ''){

            jQuery('input[name=email]').addClass('loginErr');
            errorStatus = true;
        }

        if(UserPass == ''){

            jQuery('input[name=password]').addClass('loginErr');
            errorStatus = true;
        }
        
        if(errorStatus == false){
            jQuery('input[name=password]').removeClass('loginErr');
            jQuery('input[name=email]').removeClass('loginErr');
            $ionicLoading.show({
              template: '<ion-spinner icon="android"></ion-spinner>',
              noBackdrop: false
            });

            var users = localStorageService.get('UsersData');
            for(var i = 0; i < users.length; i++){

                if((users[i].user_email == UserEmail || users[i].username == UserEmail)  && users[i].password == UserPass){
                    
                    localStorageService.set('userId',users[i].user_email);
                    $ionicLoading.hide();
                    $state.go('app.dashboard');
                    return true;
                }
            }
            $ionicLoading.show({
                template: 'Wrong user details!',
                noBackdrop: false, 
                duration: 2000
              });
            
        }else{

            $ionicLoading.hide();
        }
    }
});

