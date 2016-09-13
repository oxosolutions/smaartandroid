'use strict'

angular.module('smaart.surveyCtrl', ['ngCordova'])

.directive('question', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
      scope.$watch(attrs.question, function(QuesHtml) {
        ele.html(QuesHtml);
        $compile(ele.contents())(scope);
      });
    }
  };
})

.directive('description', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
      scope.$watch(attrs.description, function(DescHtml) {
        ele.html(DescHtml);
        $compile(ele.contents())(scope);
      });
    }
  };
})

.directive('answers', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
      scope.$watch(attrs.answers, function(AnswerHtml) {
        ele.html(AnswerHtml);
        $compile(ele.contents())(scope);
      });
    }
  };
})

.directive('image', function ($compile) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, ele, attrs) {
      scope.$watch(attrs.image, function(imageHtml) {
        ele.html(imageHtml);
        $compile(ele.contents())(scope);
      });
    }
  };
})

.controller('surveyLoad', function($q, $parse, $cordovaFile, $rootScope, $scope, $ionicLoading, localStorageService, $state, AppConfig, ionicDatePicker){

	console.log(localStorageService.get('SurveyData'));
	var SurveyData = getSurveyData($state, localStorageService);
	
	localStorageService.set('startStamp', timeStamp());

	var QuestionIndex = 0;

	window.answerData = '';

	var totalQuest = Object.keys(SurveyData).length

	$scope.totalQst = totalQuest;  //Set Total Question Value in Survey.html

	if($state.params.QuestId.trim() != ''){

		QuestionIndex = $state.params.QuestId;
	}

	$scope.currentQst = parseInt(QuestionIndex)+1; //Set Current Question number in Survey.html

	//if Survey According to Question Order
	if(AppConfig.QuestionOrder == 'true'){

		angular.forEach(SurveyData, function(value, key) {
	        if(value.question_order == QuestionIndex){

	            var paramQid = key;
	            var QuestionID = value.question_id;
	        }
	    });
	}
    //end here

    if(SurveyData[QuestionIndex] == undefined){

    	finishSurvey($state, localStorageService);
    	return false;
    }

    if(SurveyData[QuestionIndex].conditions != ''){

		var returnData = checkConditions(SurveyData[QuestionIndex].conditions, SurveyData, localStorageService);
		if(returnData.status == 'false'){

			$state.go('app.survey',{'surveyId':$state.params.surveyId, 'QuestId': returnData.next});
		}
    }

    var QuestType  =  SurveyData[QuestionIndex].question_type;
    //var QuestImage =  '<img src="img/gaph.png" alt="" class="qimg">';
    var DrawHTML = {
    				  'QuestionText': SurveyData[QuestionIndex].question_text, 
    				  'QuestionDesc': SurveyData[QuestionIndex].question_desc,
    				  'QuestAnswers': SurveyData[QuestionIndex].answers,
    				  'scope'		: $scope,
    				  'raw'			: SurveyData[QuestionIndex]
	    		   };

	switch(QuestType){

		case'text':
			text(DrawHTML, ionicDatePicker, $q, $rootScope, $cordovaFile, $parse);
		break;

		case'textarea':
			textarea(DrawHTML);
		break;

		case'number':
			number(DrawHTML);
		break;

		case'email':
			email(DrawHTML);
		break;

		case'radio':
			radio(DrawHTML);
		break;

		case'checkbox':
			checkbox(DrawHTML);
		break;

		case'select':
			select(DrawHTML);
		break;

		case'date_picker':
			date(DrawHTML, ionicDatePicker);
		break;
	}

})

.controller('nextQuest', function($scope, $rootScope, $ionicLoading, localStorageService, $state, AppConfig, ionicDatePicker){

	$scope.QuestNext = function(){
		
		var locS = localStorageService;

		var QuestionIndex = 0;
		
		if($state.params.QuestId.trim() != ''){

			QuestionIndex = $state.params.QuestId;
			if(localStorageService.get('allAnswers') != null){

				window.AllAnswers = localStorageService.get('allAnswers');
			}

		}else{
			
			if(localStorageService.get('allAnswers') != null){

				window.AllAnswers = localStorageService.get('allAnswers');

			}else{
				
				window.AllAnswers = {};
			}
		}

		//to get question_type for store in answer
		var SurveyData =  getSurveyData($state, localStorageService);
		var QuestType  =  SurveyData[QuestionIndex].question_type;
		var RequiredCheck = SurveyData[QuestionIndex].required;
		if(RequiredCheck == '1'){

			var valResult = validation($scope, QuestType, $ionicLoading);
			if(valResult == true){
				
				goToNext(QuestionIndex, $scope, QuestType, $state, SurveyData[QuestionIndex], locS);
			}
		}else{

			goToNext(QuestionIndex, $scope, QuestType, $state, SurveyData[QuestionIndex], locS);
		}
		console.log(localStorageService.get('allAnswers'));
	}

})


.controller('prevQuest', function($scope, $rootScope, $ionicLoading, localStorageService, $state, $ionicHistory){

	$scope.goToPrev = function(){
		$ionicHistory.goBack();
	}
});


function goToNext(QuestionIndex, $scope, QuestType, $state, rawData, locS){

	StoreAnswer(QuestionIndex,$scope, QuestType, rawData, locS);
				
	var $next = parseInt(QuestionIndex) + 1;
	$state.go('app.survey',{'surveyId':$state.params.surveyId, 'QuestId': $next});
}

function text(params, ionicDatePicker, $q, $rootScope, $cordovaFile, $parse){

	var $scope = params.scope;
	if(params.raw.media != 'null'){
		// console.log('Media Exist');
		params.QuestionText = checkForMedia(params.raw, $q, $rootScope, $cordovaFile);
	}else{
		// console.log('Media Not Exist');
	}

	$scope.QuesHtml = "<p>"+params.QuestionText+"</p>";
	$scope.DescHtml = "<p>"+params.QuestionDesc+"</p>";

	if(params.raw.media != 'null'){

		document.addEventListener("deviceready", function() {
			var num = 1;
			angular.forEach(params.raw.media, function(value, key){

				var splitObjKey = key.split('_');
				var splited = value.split('/');
				var splitedLength = splited.length;
				var fname = "SmaartMedia/"+splited[splitedLength-1];

			  	$cordovaFile.checkFile(cordova.file.externalRootDirectory, fname)
			      .then(function(obj) {
			      	switch(splitObjKey[0]){
			      		case'image':
			      			var model = $parse(key);
			      			model.assign($scope,obj.nativeURL);
			          	break;
			          	case'audio':
			          		var model = $parse(key);
			          		model.assign($scope,obj.nativeURL);
			          	break;
			      	}
			      }, function(error) {
			          console.log(error);
			      });

			      num++;
			});
			
		});
	}

	$scope.AnswerHtml = "<div ng-include src=\"'surveyTemplate/text.html'\"></div>";

	/*var ipObj1 = {
				      callback: function (val) {  
				        var SelectedDate = new Date(val);
				        $scope.textAnswer = SelectedDate.getFullYear()+'-'+(SelectedDate.getMonth()+1)+'-'+SelectedDate.getDate();
				      },
				      from: new Date(1990, 1, 1), 
				      to: new Date(2020, 10, 30), 
				      inputDate: new Date(), 
				      mondayFirst: true,
				      closeOnSelect: false,
				      templateType: 'modal'
			    };

	$scope.DatePicker = function(){
		ionicDatePicker.openDatePicker(ipObj1);
		
	}

	if(params.QuestImage != null){

		$scope.imageHtml = params.QuestImage;
	}*/
}

function date(params, ionicDatePicker){

	var $scope = params.scope;
	$scope.QuesHtml = "<p>"+params.QuestionText+"</p>";
	$scope.DescHtml = "<p>"+params.QuestionDesc+"</p>";
	$scope.AnswerHtml = "<div ng-include src=\"'surveyTemplate/date.html'\"></div>";
	var ipObj1 = {
				      callback: function (val) {  
				        var SelectedDate = new Date(val);
				        $scope.textAnswer = SelectedDate.getFullYear()+'-'+(SelectedDate.getMonth()+1)+'-'+SelectedDate.getDate();
				      },
				      from: new Date(1990, 1, 1), 
				      to: new Date(2020, 10, 30), 
				      inputDate: new Date(), 
				      mondayFirst: true,
				      closeOnSelect: false,
				      templateType: 'modal'
			    };

	$scope.DatePicker = function(){
		ionicDatePicker.openDatePicker(ipObj1);
		
	}
}

function textarea(params){

	var $scope = params.scope;
	$scope.QuesHtml = "<p>"+params.QuestionText+"</p>";
	$scope.DescHtml = "<p>"+params.QuestionDesc+"</p>";

	$scope.AnswerHtml = "<div ng-include src=\"'surveyTemplate/textarea.html'\"></div>";
}


function number(params){

	var $scope = params.scope;
	$scope.QuesHtml = "<p>"+params.QuestionText+"</p>";
	$scope.DescHtml = "<p>"+params.QuestionDesc+"</p>";

	$scope.AnswerHtml = "<div ng-include src=\"'surveyTemplate/number.html'\"></div>";
}

function email(params){

	var $scope = params.scope;
	$scope.QuesHtml = "<p>"+params.QuestionText+"</p>";
	$scope.DescHtml = "<p>"+params.QuestionDesc+"</p>";

	$scope.AnswerHtml = "<div ng-include src=\"'surveyTemplate/email.html'\"></div>";
}

function radio(params){

	var $scope = params.scope;
	$scope.QuesHtml = "<p>"+params.QuestionText+"</p>";
	$scope.DescHtml = "<p>"+params.QuestionDesc+"</p>";

	$scope.radioOptions = params.QuestAnswers;
	$scope.AnswerHtml = "<div ng-include src=\"'surveyTemplate/radio.html'\"></div>";
}

function checkbox(params){

	var $scope = params.scope;
	$scope.QuesHtml = "<p>"+params.QuestionText+"</p>";
	$scope.DescHtml = "<p>"+params.QuestionDesc+"</p>";

	$scope.checkboxOptions = params.QuestAnswers;
	$scope.AnswerHtml = "<div ng-include src=\"'surveyTemplate/checkbox.html'\"></div>";
}

function select(params){

	var $scope = params.scope;
	$scope.QuesHtml = "<p>"+params.QuestionText+"</p>";
	$scope.DescHtml = "<p>"+params.QuestionDesc+"</p>";

	$scope.selectOptions = params.QuestAnswers;
	$scope.AnswerHtml = "<div ng-include src=\"'surveyTemplate/select.html'\"></div>";
}



function StoreAnswer(QuestionIndex, $scope, type, rawData, locS){

	switch(type){

		case'text':
			var oneAnswer = {};
			oneAnswer['answer'] = ($scope.textAnswer === undefined)?null:$scope.textAnswer;
			oneAnswer['questid'] = rawData.question_id;
			oneAnswer['type'] = type;
			AllAnswers[QuestionIndex] = oneAnswer;
		break;

		case'textarea':
			var oneAnswer = {};
			oneAnswer['answer'] = $scope.textareaAnswer;
			oneAnswer['questid'] = rawData.question_id;
			oneAnswer['type'] = type;
			AllAnswers[QuestionIndex] = oneAnswer;
		break;

		case'number':
			var oneAnswer = {};
			oneAnswer['answer'] = $scope.numberAnswer;
			oneAnswer['questid'] = rawData.question_id;
			oneAnswer['type'] = type;
			AllAnswers[QuestionIndex] = oneAnswer;
		break;

		case'email':
			var oneAnswer = {};
			oneAnswer['answer'] = $scope.emailAnswer;
			oneAnswer['questid'] = rawData.question_id;
			oneAnswer['type'] = type;
			AllAnswers[QuestionIndex] = oneAnswer;
		break;

		case'radio':
			var oneAnswer = {};
			oneAnswer['answer'] = $scope.$parent.radioAnswer;
			oneAnswer['questid'] = rawData.question_id;
			oneAnswer['type'] = type;
			AllAnswers[QuestionIndex] = oneAnswer;
		break;

		case'checkbox':
			var oneAnswer = {};
			oneAnswer['answer'] = $scope.$parent.checkboxAnswer;
			oneAnswer['questid'] = rawData.question_id;
			oneAnswer['type'] = type;
			AllAnswers[QuestionIndex] = oneAnswer;
		break;

		case'select':
			var oneAnswer = {};
			oneAnswer['answer'] = $scope.$parent.selectAnswer.option_value;
			oneAnswer['questid'] = rawData.question_id;
			oneAnswer['type'] = type;
			AllAnswers[QuestionIndex] = oneAnswer;
		break;

		case'date_picker':
			var oneAnswer = {};
			oneAnswer['answer'] = ($scope.textAnswer === undefined)?null:$scope.textAnswer;
			oneAnswer['questid'] = rawData.question_id;
			oneAnswer['type'] = type;
			AllAnswers[QuestionIndex] = oneAnswer;
		break;
	}
	locS.set('allAnswers',AllAnswers);
	return true;
}


function replaceImageShortCodes(rawData, $q, $rootScope, $cordovaFile){
	
	var img='';
	var QuestText = rawData.question_text;
	angular.forEach(rawData.media, function(value, key) {

		var reg = new RegExp('\\[\\[' + key +'\\]\\]');
		

		QuestText = QuestText.replace(reg, '<img ng-src="{{'+key+'}}" style="max-width:100%;" />');
		

	});
	
	return QuestText;
}

function getDeferdData($scope, $q){
	var splited = value.split('/');
	var splitedLength = splited.length;
	var imagePath = '';
	var deferred = $q.defer();
	document.addEventListener("deviceready", function() {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
			imagePath = fileSystem.root.toURL() + 'SmaartMedia/' + splited[splitedLength-1];
			deferred.resolve(imagePath);
			$rootScope.$apply();
		});
	}, false);
	return deferred.promise;
}

function replaceAudioShortCode(rawData){

	var QuestText = rawData.question_text;
	angular.forEach(rawData.media, function(value, key) {

		var reg = new RegExp('\\[\\[' + key +'\\]\\]');
        QuestText = QuestText.replace(reg, '<audio controls> <source src="'+value+'" type="audio/mpeg" ></audio>');

	});
	//console.log(QuestText);
	return QuestText;
}

function checkForMedia(rawData, $q, $rootScope, $cordovaFile){

	var splitedKey
	angular.forEach(rawData.media, function(value, key) {

		splitedKey = key.split('_');
	});

	switch(splitedKey[0]){

		case'audio':
			 return replaceAudioShortCode(rawData);
		break;

		case'image':
			return replaceImageShortCodes(rawData, $q, $rootScope, $cordovaFile);
		break;

		case'video':
		break;
	}
}

function validation($scope, type, $ionicLoading){

	switch(type){

		case'text':
			if($scope.textAnswer === undefined){
				$ionicLoading.show({
			      template: 'Please fill answer!',
			      noBackdrop: false,
			      duration: 1000
			    });
			    return false;
			}
		break;

		case'textarea':
			if($scope.textareaAnswer === undefined){
				$ionicLoading.show({
			      template: 'Please fill answer!',
			      noBackdrop: false,
			      duration: 1000
			    });
			    return false;
			}
		break;

		case'number':
			if($scope.numberAnswer === undefined){
				$ionicLoading.show({
			      template: 'Please fill answer!',
			      noBackdrop: false,
			      duration: 1000
			    });
			    return false;
			}
		break;

		case'email':
			if($scope.emailAnswer === undefined || $scope.emailAnswer == ''){
				$ionicLoading.show({
			      template: 'Enter correct email',
			      noBackdrop: false,
			      duration: 1000
			    });

			    return false;
			}
		break;

		case'radio':
			if($scope.$parent.radioAnswer === undefined){
				$ionicLoading.show({
			      template: 'Please select answer',
			      noBackdrop: false,
			      duration: 1000
			    });

			    return false;
			}
		break;

		case'checkbox':
			//var CheckBoxVal = $scope.$parent.checkboxAnswer;
			if($scope.$parent.checkboxAnswer === undefined){// || validateCheckBoxSelection(CheckBoxVal) == false){
				$ionicLoading.show({
			      template: 'Please select answer',
			      noBackdrop: false,
			      duration: 1000
			    });

			    return false;
			}
		break;

		case'select':
			if($scope.$parent.selectAnswer.option_value === undefined){
				$ionicLoading.show({
			      template: 'Please select answer',
			      noBackdrop: false,
			      duration: 1000
			    });

			    return false;
			}
		break;

	}
	return true;
}

function validateCheckBoxSelection(checkBoxObj){
	
	var status = false;
	angular.forEach(checkBoxObj, function(value, key){
		
		if(value == true){

			status = true;
		}
	});

	return status;
}

function getSurveyData($state, localStorageService, index){
	//console.log(localStorageService.get('SurveyData'));
	if(index != null){

		var UpTo = index;
	}else{

		var UpTo = $state.params.surveyId;
	}
	
	//console.log('survey id '+UpTo);
	var index = 1
	var SurveyData = '';
	var SurveyNameID = {}
	angular.forEach(localStorageService.get('SurveyData'), function(value, key){

		if(index == UpTo){

			angular.forEach(value, function(vl, ky){
				SurveyData = vl;
				SurveyNameID['id'] = key;
				SurveyNameID['name'] = ky;
			});
		}

		index++;
	});
	localStorageService.set('CurrentSurveyNameID',SurveyNameID);
	return SurveyData;
}

function findQuestionIndex(rawData, questionId){

	var QuestKey = '';
	angular.forEach(rawData, function(value, key){

		if(value.question_id == questionId){

			QuestKey = key;
		}
	});

	return QuestKey;
}

function checkConditions(conditions, rawData, localStorageService){

	
	var splitedCond = conditions.split('|');
	var compareWithval = '';
	var RepQuestIDs = splitedCond[0].match(/[\w]+(?=])/g);
	var NexQuestID = splitedCond[1].match(/[\w]+(?=])/g);
	console.log(NexQuestID);
	var AllAnswers = localStorageService.get('allAnswers');
	var NextQuestInd = findQuestionIndex(rawData, NexQuestID[0]);
	var ansByIds = [];
	angular.forEach(RepQuestIDs, function(vals, keys){
		angular.forEach(AllAnswers, function(value, key){

			if(value.questid == vals){
				ansByIds.push(value.answer);
			}
		});
	})
	var index = 0;
	angular.forEach(RepQuestIDs, function(value, key){

		var reg = new RegExp('\\[\\[' + value +'\\]\\]');
		splitedCond[0] = splitedCond[0].replace(reg, '"'+ansByIds[index]+'"');
		index++;
	});
	
	
	var returnObj = {};
	returnObj['next'] = NextQuestInd;
	
	if(eval(splitedCond[0])){

		returnObj['status'] = 'false';
		return returnObj;
	}else{
		returnObj['status'] = 'true';
		return returnObj;
	}

}

function finishSurvey($state, localStorageService){

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
		StoreSurvey['status'] = 'completed';
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
		StoreSurvey['status'] = 'completed';
		StoreSurvey['starton'] = localStorageService.get('startStamp');
		FinalVar[timeStamp()] = StoreSurvey;
		localStorageService.set('SurveyList', FinalVar);
	}
	localStorageService.set('allAnswers',null);
	$state.go('app.dashboard');
}