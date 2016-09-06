(function() {
    'use strict';

    angular
        .module('angularApp')
        .filter('myDateFormat', myDateFormat)
        .service('helper', helper)
        .factory('api', api)
        .service('global', global)
        .factory('configureFormly', configureFormly)

    myDateFormat.$inject = ['$filter'];
    helper.$inject = ['$location'];
    api.$inject = ['$http', 'helper', 'Upload', 'baseUrl'];
    global.$inject = ['$uibModal', '$rootScope', 'helper', 'api', 'spinnerService', '$location', '$confirm', '$state', 'baseUrl'];
    configureFormly.$inject = ['baseUrl', '$rootScope', 'formlyConfig', 'formlyValidationMessages'];


    function myDateFormat($filter){
        return function(text){
            var  tempdate= new Date(text);
            return $filter('date')(tempdate, "medium");
        }
    }

    function helper($location){

        this.getSelectOptions = function(){
            return [
                {
                    'name': 'No filter',
                    'value': ''
                },
                {
                    'name': 'Alumni',
                    'value': 'Alumni'
                },
                {
                    'name': 'Active',
                    'value': 'Active'
                },
                {
                    'name': 'Left Program',
                    'value': 'Left Program'
                }
            ]
        }

        this.getGeneralTabGetters = function(){
            return [
                {
                    "url": "/api/admissionoffer",
                    "data": "admissionOffers",
                    "show": "showAdmissionOffersTable"

                },
                {
                    "url": "/api/comments",
                    "data": "comments",
                    "show": "showComments"
                }
            ]
        };

        this.getEducationTabGetters = function(){
            return [
                {
                    "url": "/api/education",
                    "data": "educationHistory",
                    "show": "showEducation"
                },
                {
                    "url": "/api/gmat",
                    "data": "gmatResults",
                    "show": "showGMAT"
                },
                {
                    "url": "/api/gre",
                    "data": "greResults",
                    "show": "showGRE"
                },
                {
                    "url": "/api/ielts",
                    "data": "ieltsResults",
                    "show": "showIELTS"
                },
                {
                    "url": "/api/toefl",
                    "data": "toeflResults",
                    "show": "showTOEFL"
                },
                {
                    "url": "/api/speaktest",
                    "data": "speakTestResults",
                    "show": "showSpeakTest"
                }
            ]
        };

        this.getActivityTabGetters = function () {
            return [
                {
                    "url": "/api/activity",
                    "data": "activityHistory",
                    "show": "showActivity"
                }
            ]
        };

        this.getStatusOptions = function(){
            return [
                {
                    "name": "Active",
                    "value": "Active"
                },
                {
                    "name": "Alumni",
                    "value": "Alumni"
                },
                {
                    "name": "Left Program",
                    "value": "Left Program"
                },
                {
                    "name": "Archived",
                    "value": "Archived"
                }
            ]
        };
        
        this.getProgramOptions = function(){
            return [
                {
                    "name": "Accounting",
                    "value": "ACC"
                },
                {
                    "name": "Finance",
                    "value": "FIN"
                },
                {
                    "name": "Management",
                    "value": "MGT"
                },
                {
                    "name": "Marketing",
                    "value": "MKT"
                }
            ]
        };

        this.getGenderOptions = function(){
            return [
                {
                    'name': 'Man',
                    'value': 'Man'
                },
                {
                    'name': 'Woman',
                    'value': 'Woman'
                },
                {
                    'name': 'Trans*',
                    'value': 'Trans*'
                },
                {
                    'name': 'Will Not Disclose',
                    'value': 'WND'
                }
            ]
        };

        this.getEthnicityOptions = function(){
            return [
                {
                    'name': 'African American/Black',
                    'value': 'African American/Black'
                },
                {
                    'name': 'Hispanic/Latino',
                    'value': 'Hispanic/Latino'
                },
                {
                    'name': 'Asian',
                    'value': 'Asian'
                },
                {
                    'name': 'Middle-Eastern',
                    'value': 'Middle-Eastern'
                },
                {
                    'name': 'Pacific Islander',
                    'value': 'Pacific Islander'
                },
                {
                    'name': 'Native American/Alaskan',
                    'value': 'Native American/Alaskan'
                },
                {
                    'name': 'White',
                    'value': 'White'
                },
                {
                    'name': 'Two or more races',
                    'value': 'Two or more races'
                },
                {
                    'name': 'Unknown',
                    'value': 'Unknown'
                }
            ]
        };

        this.getCitizenStatusOptions = function () {
            return [
                {
                    'name': 'Citizen',
                    'value': 'Citizen'
                },
                {
                    'name': 'Permanent Resident',
                    'value': 'Permanent Resident'
                },
                {
                    'name': 'Non Resident Alien',
                    'value': 'Non Resident Alien'
                }
            ]
        };

        this.getVisaTypeOptions = function () {
            return [
                {
                    'name': '',
                    'value': ''
                },
                {
                    'name': 'F1',
                    'value': 'F1'
                },
                {
                    'name': 'F2',
                    'value': 'F2'
                },
                {
                    'name': 'J1',
                    'value': 'J1'
                },
                {
                    'name': 'J2',
                    'value': 'J2'
                }
            ]
        }

        this.getDegreeTitleOptions = function () {
            return [
                {
                    'name': 'High School',
                    'value': 'High School'
                },
                {
                    'name': 'Bachelors',
                    'value': 'Bachelors'
                },
                {
                    'name': 'Associates',
                    'value': 'Associates'
                },
                {
                    'name': 'Masters',
                    'value': 'Masters'
                },
                {
                    'name': 'PhD',
                    'value': 'PhD'
                }
            ]
        }

        this.getTestTypeOptions = function () {
            return [
                {
                    'name': 'GMAT',
                    'value': 'GMAT'
                },
                {
                    'name': 'GRE',
                    'value': 'GRE'
                },
                {
                    'name': 'IELTS',
                    'value': 'IELTS'
                },
                {
                    'name': 'TOEFL',
                    'value': 'TOEFL'
                },
                {
                    'name': 'Speak Test',
                    'value': 'SpeakTest'
                }
            ]
        }

        this.getSemesterOptions = function () {
            var currentDate = new Date();
            var currentYear = currentDate.getFullYear();
            var futureYear = currentYear += 5;
            var oldestYear = '2004';
            var options = [];
            for (var i = futureYear; i >= oldestYear; i--) {
                var option = {
                    "name": "Fall " + i,
                    "value": "FS" + i
                }
                var option2 = {
                    "name": "Spring " + i,
                    "value": "SP" + i
                }
                options.push(option);
                options.push(option2);
            }

            return options;

        }

        this.getRequiredFormTypeOptions = function(){
            return [
                {
                    'name': 'DForm',
                    'value': 'DForm'
                },
                {
                    'name': 'CSub',
                    'value': 'CSub'
                },
                {
                    'name': 'CoC',
                    'value': 'CoC'
                },
                {
                    'name': 'Misc',
                    'value': 'Misc'
                }
            ]
        }

        this.getDissertationNumberOptions = function () {
            return [
                {
                    'name': 'D-1 (Qualifying Exam)',
                    'value': 1
                },
                {
                    'name': 'D-2 (Plan of Study)',
                    'value': 2
                },
                {
                    'name': 'D-3 (Comprehensive Exam)',
                    'value': 3
                },
                {
                    'name': 'D-3.5 (Proposal Acceptance)',
                    'value': 3.5
                },
                {
                    'name': 'D-4 (Dissertation Defense)',
                    'value': 4
                }
            ]
        }

        this.getCommitteeMemberTypeOptions = function () {
            return [
                {
                    'name': 'Chair',
                    'value': 'Chair'
                },
                {
                    'name': 'Department',
                    'value': 'Department'
                },
                {
                    'name': 'Outside',
                    'value': 'Outside'
                }
            ]
        }

        this.getDiscFormTypeOptions = function (){
            return [
                {
                    'name': 'Academic Probation - Lack of Progress',
                    'value': 'academicProbLOP'
                },
                {
                    'name': 'Academic Probation - Unsatisfactory Research Grade',
                    'value': 'academicProbURG'
                },
                {
                    'name': 'Recommendation',
                    'value': 'recommendation'
                },
                {
                    'name': 'Counseling',
                    'value': 'counseling'
                }
            ]
        }
    }

    function api($http, helper, Upload, baseUrl){
        return {
            getCSRF: getCSRF,
            getAll: getAll,
            getById: getById,
            getByIdAndParam: getByIdAndParam,
            post: post,
            uploadFile: uploadFile,
            getUserCN: getUserCN,
            getLike: getLike
        };

        function getCSRF() {
            return $http.get(baseUrl + '/api/csrf');
        }

        function getAll(url) {
            return $http.get(baseUrl + url);
        }

        function getById(url, id) {
            return $http.get(baseUrl + url + '?id=' + id);
        }

        function getByIdAndParam(url, id, param) {
            return $http.get(baseUrl + url + '?id=' + id + '&param=' + param);
        }

        function post(url, data) {
            return $http({
                method: 'POST',
                url: baseUrl + url,
                data: $.param(data),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
        }

        function uploadFile(fileToUpload, uploadUrl, data){
            return Upload.upload({
                url: baseUrl + uploadUrl,
                method: 'POST',
                data: data,
                file: fileToUpload
            });
        }

        function downloadFile(id, fileType, fileName){
            return $http.get(baseUrl + '/api/download' + '?id=' + id + '&fileType=' + fileType + '&fileName=' + fileName);
        }

        function getUserCN(){
            return $http.get(baseUrl + '/api/usercn');
        }

        function getLike(searchParam){
            return $http.get(baseUrl + '/api/getlike?searchParam=' + searchParam);
        }
    }

    function global($uibModal, $rootScope, helper, api, spinnerService, $location, $confirm, $state, baseUrl){
        var self = this;

        $rootScope.alerts = [];

        self.showAlert = function (alert) {
            $rootScope.alerts.push(alert);
        }

        self.closeAlert = function (index) {
            $rootScope.alerts.splice(index, 1);
        }

        self.search = function(){
            $state.go('results');
            api.getLike($rootScope.searchParam).then(function(response){
                $rootScope.searchTerm = $rootScope.searchParam;
                $rootScope.searchParam = null;
                $rootScope.pageSize = 20;
                $rootScope.results = response.data;
            })
        }

        self.showLoaderAndRefreshStudents = function(url){
            spinnerService.show('tcobMDCspinner');
            $rootScope.noStudentsToShow = false;
            api.getAll(url).then(function (response) {
                $rootScope.students = response.data;
                spinnerService.hide('tcobMDCspinner');
                if($rootScope.students.length < 1){
                    $rootScope.noStudentsToShow = true;
                }else{
                    if(url === '/api/students'){
                        $rootScope.showStudents = true;
                    }else if(url === '/api/archivedstudents'){
                        $rootScope.showArchivedStudents = true;
                    }
                }
            }, function(){
                spinnerService.hide('tcobMDCspinner');
                $rootScope.noStudentsToShow = true;
            })
        }

        self.addStudent = function(){
            $uibModal.open({
                scope:$rootScope,
                templateUrl: baseUrl + '/assets/partials/addStudentModal.html',
                resolve: {
                    programOptions: function(){return helper.getProgramOptions()},
                    csrf_token: api.getCSRF().then(function(response){
                        return response.data.value;
                    })
                },
                controller: function ($uibModalInstance, $rootScope, api, programOptions, csrf_token) {

                    $rootScope.addStudentFields = [
                        {
                            key: 'StudentNumber',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Student Number: ',
                                placeholder: 'Enter the student number, e.g., 11111111',
                                minlength: 6,
                                maxlength: 50,
                                required: true
                            }
                        },
                        {
                            key: 'LastName',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Last Name: ',
                                placeholder: 'Enter the last name, e.g., Smith',
                                minlength: 2,
                                maxlength: 50,
                                required: true
                            }
                        },
                        {
                            key: 'FirstName',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'First Name: ',
                                placeholder: 'Enter the first name, e.g., John',
                                minlength: 2,
                                maxlength: 50,
                                required: true
                            }
                        },
                        {
                            key: 'MiddleName',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Middle Name (Optional): ',
                                placeholder: 'Enter the middle name, e.g., Wayne',
                                minlength: 1,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'addPaw',
                            type: 'checkbox',
                            templateOptions: {
                                label: 'Add Paw Print?'
                            }
                        },
                        {
                            key: 'Pawprint',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Paw Print: ',
                                placeholder: 'Enter the paw print, e.g., jws101',
                                minlength: 3,
                                maxlength: 10,
                                required: true
                            },
                            hideExpression: '!model.addPaw'
                        },
                        {
                            key: 'Program',
                            type: 'select',
                            templateOptions: {
                                label: 'Program: (Optional)',
                                options: programOptions
                            }
                        }

                    ];

                    $rootScope.submitNewStudent = function (addStudent) {
                        var data = {
                            csrf_token: csrf_token,
                            StudentNumber: addStudent.StudentNumber,
                            LastName: addStudent.LastName,
                            FirstName: addStudent.FirstName,
                            MiddleName: addStudent.MiddleName,
                            Pawprint: addStudent.Pawprint,
                            Program: addStudent.Program
                        };
                        api.post("/api/student", data).then(function (response) {
                            $uibModalInstance.close();
                            api.getAll('/api/students').then(function (response) {
                                $rootScope.students = response.data;
                                $rootScope.showStudents = $rootScope.students.length > 0;
                            });
                            $confirm({ text: 'Student added successfully. Would you like to begin editing their page?', title: 'Success!', ok: 'Yes', cancel: 'No'}).then(function () {
                                $location.url("/edit-student/" + response.data + "/general");
                            });
                        }, function(response){
                            $rootScope.message = response.data.message;
                            api.getCSRF().then(function (response) {
                                csrf_token = response.data.value;
                            });
                        });
                    };

                    $rootScope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });
        }
    }

    function configureFormly(baseUrl, $rootScope, formlyConfig, formlyValidationMessages){

        var service = {
             initialize: initialize
         };

        return service;

        function initialize(){
            $rootScope.status = {
                isopen: false
            };

            $rootScope.toggleDropdown = function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $rootScope.status.isopen = !$rootScope.status.isopen;
            };

            var attributes = [
                'date-disabled',
                'custom-class',
                'show-weeks',
                'starting-day',
                'init-date',
                'min-mode',
                'max-mode',
                'format-day',
                'format-month',
                'format-year',
                'format-day-header',
                'format-day-title',
                'format-month-title',
                'year-range',
                'shortcut-propagation',
                'datepicker-popup',
                'show-button-bar',
                'current-text',
                'clear-text',
                'close-text',
                'close-on-date-selection',
                'datepicker-append-to-body'
            ];

            var bindings = [
                'datepicker-mode',
                'min-date',
                'max-date'
            ];

            var formats = ['M-d-yyyy', 'M-dd-yy', 'M-dd-yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];

            var ngModelAttrs = {};

            angular.forEach(attributes, function(attr) {
                ngModelAttrs[camelize(attr)] = {attribute: attr};
            });

            angular.forEach(bindings, function(binding) {
                ngModelAttrs[camelize(binding)] = {bound: binding};
            });

            formlyConfig.setType({
                name: 'datepicker',
                templateUrl:  baseUrl + '/assets/partials/datepicker.html',
                wrapper: ['bootstrapLabel', 'bootstrapHasError'],
                defaultOptions: {
                    ngModelAttrs: ngModelAttrs,
                    templateOptions: {
                        datepickerOptions: {
                            format: 'M/d/yyyy',
                            altInputFormats: formats,
                            initDate: new Date()
                        }
                    }
                },
                controller: ['$scope', function ($scope) {
                $scope.datepicker = {};

                $scope.datepicker.opened = false;

                $scope.datepicker.open = function ($event) {
                    $scope.datepicker.opened = !$scope.datepicker.opened;
                };
                }]
            });

            function camelize(string) {
                string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
                return chr ? chr.toUpperCase() : '';
                });
                // Ensure 1st char is always lowercase
                return string.replace(/^([A-Z])/, function(match, chr) {
                return chr ? chr.toLowerCase() : '';
                });
            }

            formlyConfig.setType({
                name: 'file',
                extends: 'input',
                template: '<input type="file" ngf-select ng-model="fileToUpload" accept=".pdf" ngf-max-size="20MB"/>',
                wrapper: ["bootstrapLabel", "bootstrapHasError", "validation"]
            });

            formlyConfig.setType({
                name: 'phone',
                template: '<input type="text" ng-model="model[options.key]" intl-tel-input>',
                wrapper: ["bootstrapLabel", "bootstrapHasError", "validation"]
            });
            formlyConfig.setWrapper({
                name: 'validation',
                types: ['input', 'textarea', 'datepicker', 'select', 'phone'],
                template:'<formly-transclude></formly-transclude><div class="err-messages" ng-messages="fc.$error" ng-messages-multiple><div class="some-message" ng-message="{{::name}}" ng-repeat="(name, message) in ::options.validation.messages">{{message(fc.$viewValue, fc.$modelValue, this)}} </div></div>'
            });
            //ng-if="options.formControl.$touched"
            formlyValidationMessages.addStringMessage('required', 'This field is required');
            formlyValidationMessages.addStringMessage('minlength', 'This field has too few characters');
            formlyValidationMessages.addStringMessage('maxlength', 'This field has too many characters');
            formlyValidationMessages.addStringMessage('number', 'This field must be a number');
            formlyValidationMessages.addStringMessage('email', 'You must enter a valid email format.');
            formlyValidationMessages.addStringMessage('phone', 'You must enter a valid phone format.');
            formlyValidationMessages.addStringMessage('maxSize', 'This exceeds the maximum allowed file size.');
            formlyValidationMessages.addStringMessage('date', 'This must be a valid date.');
        }
        
    }
})();
