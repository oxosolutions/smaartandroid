'use strict'

angular.module('smaart.surveyListCTRL', ['ngCordova'])

.controller('surveyListCTRL', function($scope, $ionicLoading, localStorageService, $state){
	
	
	//console.log(localStorageService.get('SurveyList'));
	//$scope.list = localStorageService.get('SurveyList');
})

.controller('stopSurvey', function($scope, $rootScope, $ionicLoading, localStorageService, $state, AppConfig, ionicDatePicker){

	$scope.StopSurvey = function(){
		console.log(localStorageService.get('CurrentSurveyID'));
		var SurveyResult = localStorageService.get('allAnswers');
		

		if(localStorageService.get('SurveyList') == null){
			
			var NameAndID = localStorageService.get('CurrentSurveyNameID');
			var StoreSurvey = {};
			var FinalVar = {};
			StoreSurvey['endon'] = timeStamp();
			StoreSurvey['answers'] = SurveyResult;
			StoreSurvey['surveyname'] = NameAndID.name;
			StoreSurvey['surveyid'] = NameAndID.id;
			StoreSurvey['status'] = 'incomplete';
			StoreSurvey['starton'] = localStorageService.get('startStamp');
			FinalVar[timeStamp()] = StoreSurvey;
			localStorageService.set('SurveyList', FinalVar);

		}else{
			var NameAndID = localStorageService.get('CurrentSurveyNameID');
			var OldEntries = localStorageService.get('SurveyList');
			var FinalVar = {};
			var StoreSurvey = {};
			angular.forEach(OldEntries, function(value, key){

				FinalVar[key] = value;
			});
			StoreSurvey['endon'] = timeStamp();
			StoreSurvey['answers'] = SurveyResult;
			StoreSurvey['surveyname'] = NameAndID.name;
			StoreSurvey['surveyid'] = NameAndID.id;
			StoreSurvey['status'] = 'incomplete';
			StoreSurvey['starton'] = localStorageService.get('startStamp');
			FinalVar[timeStamp()] = StoreSurvey;
			localStorageService.set('SurveyList', FinalVar);
		}
		localStorageService.set('allAnswers',null);
		$state.go('app.dashboard');
	}
})
.controller('incompleteSurveyCTLR', function($scope, $ionicLoading, localStorageService, $state){
	
	console.log(localStorageService.get('SurveyList'));
	var SurveyData = localStorageService.get('SurveyData');
	var SurveyListSelect = {};
	angular.forEach(SurveyData, function(value, key){

		angular.forEach(value, function(val, ky){

			SurveyListSelect[key] = ky;
		});
	});
	$scope.list = SurveyListSelect;

	$scope.surveyChange = function(){
		var sendArrayList = {};
		var SurveyID = $scope.$$childTail.surveySelect;
		var sList = localStorageService.get('SurveyList');
		angular.forEach(sList, function(value, key){

			if(value.surveyid == SurveyID && value.status == 'incomplete'){
				sendArrayList[key] = key;
			}
		});
		$scope.PendingSurvey = sendArrayList;
	}
})


.controller('CompleteSurveyCTLR', function($scope,$rootScope, $ionicLoading, localStorageService, $state, exportS, $ionicPopup){
	
	console.log(localStorageService.get('SurveyList'));
	var SurveyData = localStorageService.get('SurveyData');
	var SurveyListSelect = {};
	angular.forEach(SurveyData, function(value, key){

		angular.forEach(value, function(val, ky){

			SurveyListSelect[key] = ky;
		});
	});
	$scope.list = SurveyListSelect;

	$scope.surveyChange = function(){
		var sendArrayList = [];
		var SurveyID = $scope.$$childTail.surveySelect;
		var sList = localStorageService.get('SurveyList');
		angular.forEach(sList, function(value, key){
			var oneArray = {};
			if(value.surveyid == SurveyID && value.status == 'completed'){
				oneArray['surveydate'] = key;
				if(value.exportStatus == undefined){

					oneArray['exportYes'] = 'false';
					oneArray['exportNo'] = 'true';
				}else{
					oneArray['exportYes'] = 'true';
					oneArray['exportNo'] = 'false';
				}

				sendArrayList.push(oneArray);
			}
		});
		console.log(sendArrayList);
		$scope.PendingSurvey = sendArrayList;
	}

	$scope.exportSurv = function(){

		if(localStorageService.get('SurveyList') != null){

			
			var SurveySelected = $scope.$$childTail.surveySelect;
			var myPopup = $ionicPopup.show({
			    template: '<ul style="list-style:none;float:left;"><li><label><input style="width:0px;" type="radio" name="expSurvey" value="0" ng-model="surveyExport">&nbsp;&nbsp;Sync All</label></li><li style="margin-top:2%;"><label><input style="width:0px;" value="1" type="radio" name="expSurvey" ng-model="surveyExport">&nbsp;&nbsp;Sync only Un-Synced</label></li></ul>',
			    title: "Which Survey's You Want to Sync",
			    subTitle: 'Please select your option',
			    scope: $scope,
			    buttons: [
			      { text: 'Cancel' },
			      {
			        text: '<b>Sync</b>',
			        type: 'button-positive',
			        onTap: function(e) {
			        	//console.log($scope.$$childTail.surveyExport);
			          if ($scope.$$childTail.surveyExport == undefined) {
			            //don't allow the user to close unless he enters wifi password
			            e.preventDefault();
			          } else {
			            return $scope.$$childTail.surveyExport;
			          }
			        }
			      }
			    ]
			  });
			myPopup.then(function(res) {
			    
			    console.log(res);
			    if(res == 0){

			       var SurveyList = localStorageService.get('SurveyList');
		           var PostData = {};
				   angular.forEach(SurveyList, function(value, key){
				   		if(value.status == 'completed' && parseInt(value.surveyid) == parseInt(SurveySelected)){
				   			console.log('Working After if');
				   			var ResetValues = {};
				   			PostData[key] = value;
				   			ResetValues['answers'] = value.answers;
				   			ResetValues['endon'] = value.endon;
				   			ResetValues['starton'] = value.starton;
				   			ResetValues['status'] = value.status;
				   			ResetValues['surveyid'] = value.surveyid;
				   			ResetValues['surveyname'] = value.surveyname;
				   			ResetValues['exportStatus'] = 'true';
				   			SurveyList[key] = ResetValues;
				   			localStorageService.set('SurveyList',SurveyList);
				   		}
				   });
			    }else{

			       var SurveyList = localStorageService.get('SurveyList');
		           var PostData = {};
				   angular.forEach(SurveyList, function(value, key){
				   		if(value.status == 'completed' && parseInt(value.surveyid) == SurveySelected && value.exportStatus == undefined){
				   			var ResetValues = {};
				   			PostData[key] = value;
				   			ResetValues['answers'] = value.answers;
				   			ResetValues['endon'] = value.endon;
				   			ResetValues['starton'] = value.starton;
				   			ResetValues['status'] = value.status;
				   			ResetValues['surveyid'] = value.surveyid;
				   			ResetValues['surveyname'] = value.surveyname;
				   			ResetValues['exportStatus'] = 'true';
				   			SurveyList[key] = ResetValues;
				   			localStorageService.set('SurveyList',SurveyList);
				   		}
				   });
			    }

			   
			   // console.log(PostData);
			   console.log(localStorageService.get('SurveyList'));
			    $ionicLoading.show({
			      template: '<ion-spinner icon="android"></ion-spinner>'
			    });
				exportS.exportSurvey(PostData).then(function(){

					$ionicLoading.hide();
					$ionicLoading.show({
				      template: 'Survey Exported Successfully!',
				      noBackdrop: false,
				      duration: 2000
				    });
				});
			});

		}else{

			$ionicLoading.show({
		      template: 'No Survey Result Available!',
		      noBackdrop: false,
		      duration: 2000
		    });
		}
	}
});


function timeStamp(){

	var timestamp = Date.now(),
        date = new Date(timestamp),
        datevalues = [
           date.getFullYear(),
           date.getMonth()+1,
           date.getDate(),
           date.getHours(),
           date.getMinutes(),
           date.getSeconds(),
        ];
    var timeStamp = datevalues[0]+'-'+datevalues[1]+'-'+datevalues[2]+'-'+datevalues[3]+'-'+datevalues[4]+'-'+datevalues[5];

    return timeStamp;
}