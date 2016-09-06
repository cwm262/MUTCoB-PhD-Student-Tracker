(function() {
    'use strict';

    angular
        .module('angularApp')
        .controller('DisciplineTabController', DisciplineTabController);

    DisciplineTabController.$inject = ['$scope', '$uibModal', 'api', 'helper', '$stateParams', '$location', 'global', 'baseUrl'];

    function DisciplineTabController($scope, $uibModal, api, helper, $stateParams, $location, global, baseUrl){
        //Get student ID from URL parameter
        var studentId = $stateParams.studentId;

        $scope.baseUrl = baseUrl;

        //LOAD ALL STUDENT DATA
        function loadStudentPage() {
            api.getById('/api/student', studentId).then(function (response) {

                //Set scope variable studentData to response data
                $scope.studentData = response.data[0];

                api.getByIdAndParam('/api/discforms', studentId, 'academicProbLOP').then(function (response) {
                    $scope.academicProbLOPs = response.data;
                });
                api.getByIdAndParam('/api/discforms', studentId, 'academicProbURG').then(function (response) {
                    $scope.academicProbURGs = response.data;
                });
                api.getByIdAndParam('/api/discforms', studentId, 'recommendation').then(function (response) {
                    $scope.recommendations = response.data;
                });
                api.getByIdAndParam('/api/discforms', studentId, 'counseling').then(function (response) {
                    $scope.counselings = response.data;
                });
                    
            }, function (response) {
                $location.url('/404');
            });
        }

        loadStudentPage();

        /*
         MODAL: Add Discipline Form
         */
        $scope.addDiscForm = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/uploadDiscForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    }),
                    typeOptions: function () { return helper.getDiscFormTypeOptions() },
                    semesterOptions: function() { return helper.getSemesterOptions() }
                },
                controller: function ($uibModalInstance, $scope, csrf_token, typeOptions, semesterOptions) {

                    $scope.formats = ['M/d/yyyy', 'M-d-yyyy', 'M-dd-yy', 'M-dd-yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                    $scope.format = $scope.formats[0];

                    $scope.dateOptions = {
                        formatYear: 'yyyy',
                        maxDate: new Date(2030, 7, 4),
                        minDate: new Date(1976, 7, 4),
                        startingDay: 1
                    };

                    $scope.datepicker1 = {};

                    $scope.datepicker1.opened = false;

                    $scope.datepicker1.open = function ($event) {
                        $scope.datepicker1.opened = !$scope.datepicker1.opened;
                    };

                    $scope.typeOptions = typeOptions;

                    $scope.semesterOptions = semesterOptions;

                    $scope.submitDiscForm = function (fileToUpload, submissionDate, formType, semester) {
                        var data = {};
                        function assignData() {
                            data.StudentId = $scope.studentData.Id;
                            data.csrf_token = csrf_token;
                            if (submissionDate) {
                                data.SubmitDate = new Date(submissionDate);
                                data.SubmitDate = data.SubmitDate.toDateString();
                            }
                            data.FileType = formType.value;
                            if (semester) {
                                data.Semester = semester.value;
                            }
                        }
                        assignData();
                         api.uploadFile(fileToUpload, '/api/uploaddiscform', data).then(function (response) {
                             $uibModalInstance.close();
                             loadStudentPage();
                             global.showAlert({
                                 type: 'success',
                                 msg: 'Discipline form added successfully.'
                             });
                         }, function (response) {
                             $scope.message = response.data.message;
                             api.getCSRF().then(function (response) {
                                 csrf_token = response.data.value;
                             });
                             assignData();
                         });
                    };
                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });
        };

        /*
         * Modal: Update Discipline Form
         */
        $scope.updateDiscForm = function (form, formType) {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updateDiscForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    }),
                    semesterOptions: function () { return helper.getSemesterOptions() }
                },
                controller: function ($uibModalInstance, $scope, csrf_token, semesterOptions) {

                    $scope.formats = ['M/d/yyyy', 'M-d-yyyy', 'M-dd-yy', 'M-dd-yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                    $scope.format = $scope.formats[0];

                    $scope.dateOptions = {
                        formatYear: 'yyyy',
                        maxDate: new Date(2030, 7, 4),
                        minDate: new Date(1976, 7, 4),
                        startingDay: 1
                    };

                    $scope.datepicker1 = {};

                    $scope.datepicker1.opened = false;

                    $scope.datepicker1.open = function ($event) {
                        $scope.datepicker1.opened = !$scope.datepicker1.opened;
                    };

                    /**/

                    $scope.updateDiscFormModel = {};

                    angular.copy(form, $scope.updateDiscFormModel);

                    $scope.formType = formType;

                    $scope.semesterOptions = semesterOptions;

                    if ($scope.updateDiscFormModel.SubmitDate) {
                        $scope.updateDiscFormModel.SubmitDate = new Date($scope.updateDiscFormModel.SubmitDate);
                    }

                    $scope.submitUpdatedForm = function (fileToUpload, updateDiscFormModel) {
                        var data = {};
                        function assignData() {
                            data.Id = updateDiscFormModel.Id;
                            data.StudentId = studentId;
                            data.csrf_token = csrf_token;
                            data.FileType = formType;

                            if (updateDiscFormModel.SubmitDate) {
                                if (form.SubmitDate) {
                                    var currentSubmitDate = new Date(form.SubmitDate);
                                    if (updateDiscFormModel.SubmitDate.getTime() != currentSubmitDate.getTime()) {
                                        data.SubmitDate = updateDiscFormModel.SubmitDate.toDateString();
                                    }
                                } else {
                                    data.SubmitDate = updateDiscFormModel.SubmitDate.toDateString();
                                }
                            }
                            if (updateDiscFormModel.Semester) {
                                if (form.Semester != updateDiscFormModel.Semester) {
                                    data.Semester = updateDiscFormModel.Semester;
                                }
                            }
                            if (updateDiscFormModel.PDFName) {
                                data.PDFName = updateDiscFormModel.PDFName;
                            }
                        }
                        assignData();
                        api.uploadFile(fileToUpload, '/api/updatediscform', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Discipline form updated successfully.'
                            });
                        }, function (response) {
                            $scope.message = response.data.message;
                            api.getCSRF().then(function (response) {
                                csrf_token = response.data.value;
                            });
                        });
                    };

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });
        };

        /*
        Remove/Delete Discipline Form
        */
        $scope.removeDiscForm = function (form) {
            api.getCSRF().then(function (response) {
                var csrf_token = response.data.value;
                var data = {};
                data.csrf_token = csrf_token;
                data.StudentId = form.StudentId;
                data.Id = form.Id;
                data.PDFName = form.PDFName;
                data.FileType = form.FileType;
                api.post('/api/deletediscform', data).then(function (response) {
                    loadStudentPage();
                    global.showAlert({
                        type: 'success',
                        msg: 'Discipline form removed successfully.'
                    });
                }, function (response) {
                    global.showAlert({
                        type: 'danger',
                        msg: response.data.message
                    });
                });
            });
        };
    }
})();