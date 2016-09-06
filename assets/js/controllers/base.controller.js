(function() {
    'use strict';

    angular
        .module('angularApp')
        .controller('BaseController', BaseController);

    BaseController.$inject = ['$scope', 'api', 'helper', '$rootScope', 'global'];

    function BaseController($scope, api, helper, $rootScope, global){
        /*
        The following variables determine how the PhD Tracker sorts students on the index (ie home) page.
        - pageSize is how many students are displayed per page by default. User can toggle this.
        - sortType is how the students are sorted by default. To sort by Id is to sort from newest entries to oldest.
        - sortReverse = true means it is descending order by default.
         */
        $scope.pageSize = 20;
        $scope.sortType = 'Id';
        $scope.sortReverse = true;

        $scope.selectOptions = helper.getSelectOptions();
        $scope.statusSelect = $scope.selectOptions[0];

        //Empty array for students to be loaded.
        $rootScope.students = [];

        $scope.archiveStudent = function (id) {
            var data = {};
            api.getCSRF().then(function (response) {
                data.csrf_token = response.data.value;
                data.Id = id;
                data.PhDStatus = "Archived";
                api.post('/api/updatestatus', data).then(function (response) {
                    global.showLoaderAndRefreshStudents('/api/students');
                }, function (response) {
                    $scope.message = response.statusText;
                });
            });
        };
    }
})();