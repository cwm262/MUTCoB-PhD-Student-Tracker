
(function() {

    "use strict";

    angular
        .module('angularApp')
        .config(configureHttpProvider)
        .config(configurePaginationTemplate)
        .config(configureIntlInputOptions)

    configureHttpProvider.$inject = ['$httpProvider'];
    configurePaginationTemplate.$inject = ['baseUrl', 'paginationTemplateProvider'];
    configureIntlInputOptions.$inject = ['baseUrl', 'intlTelInputOptions'];


    function configureHttpProvider($httpProvider){
        $httpProvider.useApplyAsync(true);
    }

    function configurePaginationTemplate(baseUrl, paginationTemplateProvider){
        paginationTemplateProvider.setPath(baseUrl + '/assets/partials/dirPagination.tpl.html');
    }

    function configureIntlInputOptions(baseUrl, intlTelInputOptions){
        angular.extend(intlTelInputOptions, {
            nationalMode: false,
            utilsScript: baseUrl + '/assets/js/libraries/utils.min.js',
            defaultCountry: 'auto',
            preferredCountries: ['us'],
            autoFormat: true,
            autoPlaceholder: true
        });
    }

    
})();
