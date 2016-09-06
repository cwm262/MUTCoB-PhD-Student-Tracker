(function() {
    'use strict';

    angular
        .module('angularApp')
        .controller('ActivityTabController', ActivityTabController);

    ActivityTabController.$inject = ['$scope', '$uibModal', 'api', 'helper', '$stateParams', '$location', 'global', 'baseUrl'];

    function ActivityTabController($scope, $uibModal, api, helper, $stateParams, $location, global, baseUrl){

        //Get student ID from URL parameter
        var studentId = $stateParams.studentId;

        $scope.pageSize = 15;
        $scope.sortType = 'DateModified';
        $scope.sortReverse = true;
           
        //LOAD ALL STUDENT DATA
        function loadStudentPage() {
            api.getById('/api/student', studentId).then(function (response) {

                //Set scope variable studentData to response data
                $scope.studentData = response.data[0];

                api.getById('/api/changes', studentId).then(function(response){
                    $scope.changes = response.data;
                })
            }, function (response) {
                $location.url('/404');
            });
        }

        loadStudentPage();
    }
})();