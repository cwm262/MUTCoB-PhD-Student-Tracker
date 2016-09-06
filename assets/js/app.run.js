(function() {
    'use strict';

    angular
        .module('angularApp')
        .run(runBlock);

    runBlock.$inject = ['$rootScope', 'global', 'configureFormly'];

    function runBlock($rootScope, global, configureFormly){

        $rootScope.globalAPI = global;
        configureFormly.initialize();

    }

})();