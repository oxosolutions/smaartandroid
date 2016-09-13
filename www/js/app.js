
angular.module('smaart', ['ionic', 'smaart.controllers', 'smaart.services', 'smaart.surveyCtrl','smaart.surveyListCTRL', 'smaart.dashboard', 'LocalStorageModule', 'ionic-datepicker'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(['$compileProvider', function($compileProvider) {
       $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|content|file|blob|data):/);
}])

.constant('AppConfig', {'QuestionOrder': 'false'})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.dashboard', {
    url: '/dashboard',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/dashboard.html',
        controller: 'dashboardCtrl'
      }
    }
  })

  .state('app.surveylist', {
    url: '/surveylist',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/survey-list.html',
        controller: 'surveyListCTRL'
      }
    }
  })

  .state('app.incomplete', {
    url: '/incomplete',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/incomplete.html',
        controller: 'incompleteSurveyCTLR'
      }
    }
  })

.state('app.completed', {
    url: '/completed',
    cache: false,
    views: {
      'menuContent': {
        templateUrl: 'templates/completed.html',
        controller: 'CompleteSurveyCTLR'
      }
    }
  })

  .state('app.survey', {
      url: '/survey/:surveyId/:QuestId',
     
      views: {
        'menuContent': {
          templateUrl: 'templates/survey.html'
        }
      }
    })
    
  .state('login', {
    cache: false,
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
