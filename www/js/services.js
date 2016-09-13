/**
*  Module
*
* Smaart App All WebServices
*/
angular.module('smaart.services', ['ngCordova'])

.factory('appData', function($http, $ionicLoading, localStorageService, $q){
	
	
    $ionicLoading.show({
      template: '<ion-spinner icon="android"></ion-spinner><p>Loading user data..</p>'
    });

	var ApiURL = 'http://sanaviz.com/api/';

	$http({

	    url: ApiURL,
	    method: 'POST',
	    data: 'action=activate&app_secret=986095dbbc971043bc97babb6939ffc1',
	    headers: {
	        'Content-Type': 'application/x-www-form-urlencoded'
	    }
	}).then(function(res){
		console.log(res);
		localStorageService.set('UsersData',res.data.users);
		var allSurveys = {};
		var index = 1;
		var dataLength = Object(res.data.surveys).length;
		angular.forEach(res.data.surveys, function(value, id){

			$ionicLoading.hide();

			$ionicLoading.show({
		      template: '<ion-spinner icon="android"></ion-spinner><p>Loading survey data..</p>'
		    });

			$http({

			    url: ApiURL,
			    method: 'POST',
			    data: 'action=import&app_id=1200020001&app_secret=986095dbbc971043bc97babb6939ffc1&id='+value.id,
			    headers: {
			        'Content-Type': 'application/x-www-form-urlencoded'
			    }
			}).then(function(res){
				//allSurveys[value.name] = res.data;
				var nm = {};
				nm[value.name] = res.data
				allSurveys[value.id] = nm;
				localStorageService.set('SurveyData',allSurveys);
				if(index == dataLength){

					$ionicLoading.hide();
					$ionicLoading.show({
				      template: '<ion-spinner icon="android"></ion-spinner><p>Loading media..</p>'
				    });
					console.log(localStorageService.get('SurveyData'));
					// console.log(localStorageService.get('UsersData'));
					loadingMedia($ionicLoading);
				}
				index++;
			});
		});

	});
	


	function loadingMedia($ionicLoading){

		   // console.log(localStorageService.get('SurveyData'));
		   var SurveyData = localStorageService.get('SurveyData');
		   angular.forEach(SurveyData, function(value, key){
		   		// console.log(value);
		   		angular.forEach(value, function(sValue, sKey){

		   			angular.forEach(sValue, function(lValue, lKey){

		   				// console.log(lValue);
		   				if(lValue.media != 'null'){

			                angular.forEach(lValue.media, function(mediaLink, mediaKey){

			                    var fileSplited = mediaLink.split('/');
			                    var fileLength = fileSplited.length;
			                    var fileName = fileSplited[fileLength-1];

			                    /*console.log(fileName);
			                    console.log(mediaLink);*/

			                    var downloadUrl = mediaLink;
			                    var relativeFilePath = fileName;  // using an absolute path also does not work
			                    document.addEventListener("deviceready", function() {
			                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
			                       fileSystem.root.getDirectory("SmaartMedia", {create: true, exclusive: false});
			                       var fileTransfer = new FileTransfer();
			                       fileTransfer.download(
			                          downloadUrl,

			                          // The correct path!
			                          fileSystem.root.toURL() + 'SmaartMedia/' + relativeFilePath,

			                          function (entry) {
			                             /*alert("Success");*/
			                          },
			                          function (error) {
			                             alert("Error during download. Code = " + error.code);
			                          }
			                       );
			                    });
			                  }, false);
			                });
			            }
		   			})
		   		})
		   });

	      

	     $ionicLoading.hide();
	}


	return {


	}
})

.factory('exportS', function($http, $ionicLoading, localStorageService, $q){

	var ApiURL = 'http://sanaviz.com/api/';

	return {

		exportSurvey: function(PostData){
	           console.log(PostData);
	           return $http({

						    url: ApiURL,
						    method: 'POST',
						    data: 'action=export&app_id=1200020001&app_secret=986095dbbc971043bc97babb6939ffc1&data='+JSON.stringify(PostData),
						    headers: {
						        'Content-Type': 'application/x-www-form-urlencoded'
						    }
						})
	      },
	}
})
