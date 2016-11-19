/**
 * Created by Xeonchik on 17.11.2016.
 */

myApp.controller('ProjectController', ['$scope', '$routeParams', 'ProjectService', 'RepositoryService', '$rootScope', '$http', function($scope, $routeParams, ProjectService, RepositoryService, $rootScope, $http) {
    $rootScope.project = ProjectService.getCurrent($routeParams.projectId);
    var project = $rootScope.project;
    $scope.cloning_process = false;

    $scope.addRepo = function(repo) {
        $scope.cloning_process = true;
        $scope.clone_error = false;

        $http.post('/api/repository/add', {url: repo.url, projectId: $rootScope.project.id}).success(function (data) {
            if(data.result == true) {
                $('#addRepositoryModal').modal('hide');
                ProjectService.refresh();
                project = ProjectService.getCurrent($routeParams.projectId);
                $rootScope.project = project;

                $scope.cloning_process = false;
            } else {
                $scope.clone_error = data.error;
                $scope.cloning_process = false;
            }
        });
    };

    $scope.checkoutCommon = function(branch) {
        angular.forEach(project.repositories, function(repository){
            $http.get('/api/repository/switch', { params: {projectId: project.id, repositoryName: repository.name, branch: branch}}).success(function(){
                RepositoryService.refresh(project.id, repository);
            });
        });
    };

    $scope.fetchAll = function() {
        $http.get('/api/repository/fetch-all', { params: { projectId: project.id} }).success(function (data) {

        });
    };

    $scope.pullAll = function() {
        $http.get('/api/repository/pull-all', { params: { projectId: project.id} }).success(function (data) {

        });
    };

    $scope.switchBranch = function(repository, branch) {
        $http.get('/api/repository/switch', { params: {projectId: project.id, repositoryName: repository.name, branch: branch}}).success(function(){
            RepositoryService.refresh(project.id, repository);
        });
    };

    $scope.removeRepo = function(repository) {
        $http.get('/api/repository/remove', { params: { projectId: project.id, repositoryName: repository.name } } ).success(function(){
            var idx = project.repositories.indexOf(repository);
            project.repositories.splice(idx, 1);
        });
    };

    $scope.toggleRepo = function(repo) {
        project.repositories.forEach(function(item){
            item.selected = false;
        });
        repo.selected = true;
    };

    $scope.getCommonBranches = function (){
        var common_branches = [];

        angular.forEach(project.repositories, function (repo) {
            angular.forEach(repo.branches, function(branch) {
                if (common_branches[branch] == undefined) {
                    common_branches[branch] = 1;
                } else {
                    common_branches[branch]++;
                }
            });
        });

        var result = [];
        for (var branch in common_branches) {
            if(common_branches.hasOwnProperty(branch) && common_branches[branch] == project.repositories.length) {
                result.push(branch);
            }
        }
        return result;
    };

    $scope.createCommonBranch = function(newBranchName) {
        if(newBranchName == undefined) {
            return;
        }

        angular.forEach(project.repositories, function (repository) {
            $http.get(
                '/api/repository/branch',
                {
                    params: {projectId: project.id, repositoryName: repository.name, branch: newBranchName}
                })
                .success(function(data){
                    $scope.switchBranch(repository, newBranchName);
                });
        });

        $('#createBranchModal').modal('hide');
    };

    angular.forEach(project.repositories, function (item) {
        RepositoryService.refresh(project.id, item);
    });
}]);