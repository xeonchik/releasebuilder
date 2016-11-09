/**
 * Created by Xeonchik on 09.11.2016.
 */

myApp.controller('MainController', ['$scope', '$location', '$http', 'ProjectService', function($scope, $location, $http, ProjectService) {
    $scope.changeView = function(view){
        $location.path(view);
    };

    $http.get('/api/project/list').success(function (data) {
        $scope.projects = data;
        ProjectService.projects = data;
    });

    $scope.selectProject = function (selected) {
        ProjectService.select = selected;
    };
}]);

