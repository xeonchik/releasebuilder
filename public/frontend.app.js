'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp',['ngRoute', 'ngAnimate']);

myApp.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
  //$locationProvider.html5Mode(true);
  $routeProvider
      .when('/', {
        templateUrl : 'pages/start.html',
        controller  : 'MainController'
      })
      .when('/new-project', {
        templateUrl: 'pages/new_project.html',
        controller: 'NewProjectController'
      })
      .when('/project/:projectId', {
          templateUrl: 'pages/project.html',
          controller: 'ProjectController'
      })
      .otherwise('/')
}]);

myApp.controller('NewProjectController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    $scope.project = {};

    $scope.save = function (project) {
        $http.post('/api/project/save', $scope.project).success(function (data) {
            if(data.error) {
                $scope.errors = {
                    hasError: true,
                    text: data.error
                };
            } else {
                $scope.errors = {};
                $location.path('/');
            }
        });
    }

}]);

myApp.controller('ProjectController', ['$scope', '$routeParams', 'ProjectService', '$rootScope', '$http', function($scope, $routeParams, ProjectService, $rootScope, $http) {
  $rootScope.project = ProjectService.getCurrent($routeParams.projectId);
    var project = $rootScope.project;

    $scope.addRepo = function(repo) {
        $http.post('/api/repository/add', {url: repo.url, projectId: $rootScope.project.id}).success(function (data) {
            if(data.result == true) {
                $('#myModal').modal('hide');
            }
        });
    };

    $scope.fetchAll = function() {
        $http.get('/api/repository/fetch', { params: { projectId: project.id} }).success(function (data) {

        });
    };

    $scope.pullAll = function() {
        $http.get('/api/repository/pull', { params: { projectId: project.id} }).success(function (data) {

        });
    };

    angular.forEach(project.repositories, function (item, key) {
        $http.get('/api/repository/info', {params:{projectId: project.id, repositoryName: item.name}}).success(function (data) {
            item.current_commit = data.commit;
            item.last_commit_message = data.message;
            item.current_branch = data.branch;
        });
    });
}]);

myApp.factory('ProjectService', ['$rootScope', function($rootScope){
  return {
    getCurrent: function(projectId) {
      var result = undefined;
      angular.forEach(this.projects, function(value, key){
        if(projectId == value.id) {
          result = value;
        }
      });
      return result;
    }
  };
}]);

myApp.controller('RepositoriesController', ['$scope', '$routeParams', 'ProjectService', '$rootScope', function($scope, $routeParams, ProjectService, $rootScope) {

}]);

myApp.controller('ConsoleController', ['$scope', function($scope) {
    $scope.test = 12323;
}]);

myApp.component('consoleComponent', {
    templateUrl: 'components/templates/console.html',
    controller: ['$scope', '$http', function ($scope, $http) {
        $http.get('/api/repository/log').success(function (data) {
            $scope.entries = data;
        });
    }]
});