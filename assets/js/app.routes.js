(function() {

    "use strict";

    angular
        .module('angularApp')
        .config(routing);

    routing.$inject = ['$stateProvider', '$urlRouterProvider', 'baseUrl'];

    function routing($stateProvider, $urlRouterProvider, baseUrl){
        $urlRouterProvider.otherwise("/");

        $urlRouterProvider.when('/edit-student/:studentId', '/edit-student/:studentId/general');

        $stateProvider
            .state('404', {
                url: '/404',
                templateUrl: baseUrl + '/assets/partials/404.html'
            })
            .state('main', {
                url: "/",
                templateUrl: baseUrl + "/assets/partials/viewStudentList.html",
                controller: "BaseController"
            })
            .state('archived', {
                url: '/archived',
                templateUrl: baseUrl + '/assets/partials/viewArchivedStudentList.html',
                controller: 'ArchivedController'
            })
            .state('results', {
                url: '/search-results',
                templateUrl: baseUrl + '/assets/partials/viewSearchResults.html'
            })
            .state('editStudent', {
                url: "/edit-student/:studentId",
                templateUrl: baseUrl + "/assets/partials/editStudent.html",
                controller: "TabController"
            })
                .state('editStudent.general', {
                    url: "/general",
                    templateUrl: baseUrl + "/assets/partials/editStudentGeneralTab.html",
                    controller: "GeneralTabController"
                })
                .state('editStudent.education', {
                    url: "/education-and-test-scores",
                    templateUrl: baseUrl + "/assets//partials/editStudentEducationTab.html",
                    controller: "EducationTabController"
                })
                .state('editStudent.program', {
                    url: "/program-and-dissertation",
                    templateUrl: baseUrl + "/assets/partials/editStudentProgramTab.html",
                    controller: "ProgramTabController"
                })
                .state('editStudent.discipline', {
                    url: "/discipline",
                    templateUrl: baseUrl + "/assets/partials/editStudentDisciplineTab.html",
                    controller: "DisciplineTabController"
                })
                .state('editStudent.activity', {
                    url: "/activity",
                    templateUrl: baseUrl + "/assets/partials/editStudentActivityTab.html",
                    controller: "ActivityTabController"
                })
    }
})();