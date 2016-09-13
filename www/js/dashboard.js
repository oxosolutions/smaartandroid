'use strict'

angular.module('smaart.dashboard', ['ngCordova'])

.controller('dashboardCtrl', function($scope, $ionicLoading, localStorageService, $ionicPopover, $state, $ionicActionSheet, $timeout, $ionicBackdrop){

	var allSurveys = localStorageService.get('SurveyData');
	var buttonsArray = [];
	angular.forEach(allSurveys, function(value, key){
		angular.forEach(value, function(vl,ky){
			
			var text = {text: '&nbsp;&nbsp;&nbsp;&nbsp; '+ky};
			buttonsArray.push(text);
		});
	});
	
    $scope.goToSurvey = function($event){

	     var hideSheet = $ionicActionSheet.show({
	     buttons: buttonsArray,
	     titleText: 'Select Survey',
	     cancelText: 'Cancel',
	     cancel: function() {
	          // add cancel code..
	        },
	     buttonClicked: function(index, data) {
	     	var SurveyData = getSurveyData($state, localStorageService, index+1);
	     	if(SurveyData.length == 0){

				$ionicLoading.show({
					      template: 'Survey data empty!',
					      noBackdrop: false,
					      duration: 2000
					    });
				return true;
			}else{

				$state.go('app.survey',{'surveyId': index+1});
			}
	       		
	     }
	   });

    }
});