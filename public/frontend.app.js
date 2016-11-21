'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp',['ngRoute']);

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



myApp.factory('RepositoryService', ['$rootScope', '$http', function($rootScope, $http) {
    return {
        refresh: function (projectId, repository) {
            $http.get('/api/repository/info', {params:{projectId: projectId, repositoryName: repository.name}}).success(function (data) {
                repository.current_commit = data.commit;
                repository.last_commit_message = data.message;
                repository.current_branch = data.branch;
                repository.commit_author = data.commit_author;
                repository.commit_date = data.commit_date;
                repository.branches = data.remote_branches;
            });
        }
    }
}]);

myApp.factory('ProjectService', ['$rootScope', '$http', function($rootScope, $http){
    return {
        /**
         * Refresh projects from remote
         */
        refresh: function() {
            $http.get('/api/project/list').success(function (data) {
                $rootScope.projects = data;
                //this.projects = data;
            });
        },
        /**
         * Get project by id (todo: rename it)
         */
        getCurrent: function(projectId) {
            var result = undefined;
            $rootScope.projects.forEach(function(value){
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

myApp.component('consoleComponent', {
    templateUrl: 'components/templates/console.html',
    controller: ['$scope', '$http', function ($scope, $http) {

        $scope.refresh = function() {
            $http.get('/api/repository/log').success(function (data) {
                $scope.entries = data;
            });
        };

        $scope.refresh();
        setInterval($scope.refresh, 50000);
    }]
});