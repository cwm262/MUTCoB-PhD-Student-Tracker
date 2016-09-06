(function() {
    'use strict';

    angular
        .module('angularApp')
        .controller('ArchivedController', ArchivedController);

    ArchivedController.$inject = ['$scope', '$uibModal', 'api', 'helper', '$stateParams', '$location', 'global', 'baseUrl'];

    function ArchivedController($scope){
        /*
            The following variables determine how the PhD Tracker sorts students on the index (ie home) page.
            - pageSize is how many students are displayed per page by default. User can toggle this.
            - sortType is how the students are sorted by default. To sort by Id is to sort from newest entries to oldest.
            - sortReverse = true means it is descending order by default.
         */
            $scope.pageSize = 20;
            $scope.sortType = 'Id';
            $scope.sortReverse = true;

    }
})();
