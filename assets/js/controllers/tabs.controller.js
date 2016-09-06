(function() {
    'use strict';

    angular
        .module('angularApp')
        .controller('TabController', TabController);

    TabController.$inject = ['$scope', 'api', 'helper', '$stateParams', '$location'];
    
    function TabController($scope, api, helper, $stateParams, $location){
        api.getById('/api/getstudentname', $stateParams.studentId).then(function(response){
            var studentFirstAndLastName = response.data[0];
            $scope.fName = studentFirstAndLastName.FirstName;
            $scope.lName = studentFirstAndLastName.LastName;
            $scope.id = $stateParams.studentId;
            $scope.status = studentFirstAndLastName.PhDStatus;
        });

        $scope.permanentlyDeleteStudent = function (id) {
            var data = {};
            api.getCSRF().then(function (response) {
                data.csrf_token = response.data.value;
                data.Id = id;
                data.PhDStatus = "Deleted";
                api.post('/api/updatestatus', data).then(function (response) {
                    $location.url('/archived');
                }, function (response) {
                });
            });
        };
        
        $scope.tabData   = [
            {
                heading: 'General',
                route:   'editStudent.general'
            },
            {
                heading: 'Education',
                route:   'editStudent.education'
            },
            {
                heading: 'Program',
                route: 'editStudent.program'
            },
            {
                heading: 'Discipline',
                route: 'editStudent.discipline'
            },
            {
                heading: 'Activity',
                route: 'editStudent.activity'
            }
        ];
    }

})();