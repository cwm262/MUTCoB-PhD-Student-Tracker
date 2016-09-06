(function() {
    'use strict';

    angular
        .module('angularApp')
        .controller('EducationTabController', EducationTabController);

    EducationTabController.$inject = ['$scope', '$uibModal', 'api', 'helper', '$stateParams', '$location', 'global', 'baseUrl'];

    function EducationTabController($scope, $uibModal, api, helper, $stateParams, $location, global, baseUrl){

        //Get student ID from URL parameter
        var studentId = $stateParams.studentId;

        //LOAD ALL STUDENT DATA
        function loadStudentPage() {
            api.getById('/api/student', studentId).then(function (response) {

                //Set scope variable studentData to response data
                $scope.studentData = response.data[0];

                var getters = helper.getEducationTabGetters();

                //Loop through the returned json array, calling each getter
                getters.forEach(function (index) {
                    api.getById(index.url, studentId).then(function (response) {
                        $scope[index.data] = response.data; //eg $scope.admissionOffers = response.data;
                        $scope[index.show] = $scope[index.data].length > 0; //eg $scope.showAdmissionOffersTable = true;
                    });
                });
            }, function (response) {
                $location.url('/404');
            });
        }

        loadStudentPage();

        /*
         * Modal: Add to Education Form
         */
        $scope.addEducation = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/addEducationForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    }),
                    degreeTitleOptions: function () { return helper.getDegreeTitleOptions() }
                },
                controller: function ($uibModalInstance, $scope, csrf_token, degreeTitleOptions) {

                    $scope.educationFields = [
                        {
                            key: 'Institution',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Institution: ',
                                placeholder: 'Name of the institution, e.g., University of Missouri',
                                minlength: 3,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'Location',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Location: ',
                                placeholder: 'e.g., Columbia, MO',
                                minlength: 3,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'StartDate',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Start Date: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'EndDate',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'End Date: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'DegreeTitle',
                            type: 'select',
                            templateOptions: {
                                label: 'Degree Title: ',
                                options: degreeTitleOptions
                            }
                        },
                        {
                            key: 'Degree',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Degree: ',
                                placeholder: 'e.g., Accountancy',
                                minlength: 3,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'DegreeDate',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Degree Date: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'GPA',
                            type: 'input',
                            templateOptions: {
                                type: 'number',
                                label: 'GPA: ',
                                placeholder: 'e.g., 4.0'
                            }
                        }
                    ];

                    $scope.submitEducation = function (education) {
                        var data = {};
                        angular.copy(education, data);
                        data.csrf_token = csrf_token;
                        data.StudentId = $scope.studentData.Id;

                        if (data.StartDate) {
                            data.StartDate = data.StartDate.toDateString();
                        }
                        if (data.EndDate) {
                            data.EndDate = data.EndDate.toDateString();
                        }
                        if (data.DegreeDate) {
                            data.DegreeDate = data.DegreeDate.toDateString();
                        }

                        api.post('/api/addeducation', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Added education entry successfully.'
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
         * Modal: Update Education Form
         */
        $scope.updateEducation = function (education) {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updateEducationForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    }),
                    degreeTitleOptions: function () { return helper.getDegreeTitleOptions() }
                },
                controller: function ($uibModalInstance, $scope, csrf_token, degreeTitleOptions) {

                    $scope.updateEducationModel = {};
                    angular.copy(education, $scope.updateEducationModel);

                    if ($scope.updateEducationModel.StartDate) {
                        $scope.updateEducationModel.StartDate = new Date($scope.updateEducationModel.StartDate);
                    }
                    if ($scope.updateEducationModel.EndDate) {
                        $scope.updateEducationModel.EndDate = new Date($scope.updateEducationModel.EndDate);
                    }
                    if ($scope.updateEducationModel.DegreeDate) {
                        $scope.updateEducationModel.DegreeDate = new Date($scope.updateEducationModel.DegreeDate);
                    }
                    if ($scope.updateEducationModel.GPA) {
                        $scope.updateEducationModel.GPA = Number($scope.updateEducationModel.GPA);
                    }

                    $scope.updateEducationFields = [
                        {
                            key: 'Institution',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Institution: ',
                                placeholder: 'Name of the institution, e.g., University of Missouri',
                                minlength: 3,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'Location',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Location: ',
                                placeholder: 'e.g., Columbia, MO',
                                minlength: 3,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'StartDate',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Start Date: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'EndDate',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'End Date: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'DegreeTitle',
                            type: 'select',
                            templateOptions: {
                                label: 'Degree Title: ',
                                options: degreeTitleOptions
                            }
                        },
                        {
                            key: 'Degree',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Degree: ',
                                placeholder: 'e.g., Accountancy',
                                minlength: 3,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'DegreeDate',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Degree Date: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'GPA',
                            type: 'input',
                            templateOptions: {
                                type: 'number',
                                label: 'GPA: ',
                                placeholder: 'e.g., 4.0'
                            }
                        }
                    ];

                    $scope.submitEducationUpdate = function (updateEducationModel) {
                        var data = {};

                        data.csrf_token = csrf_token;
                        data.Id = updateEducationModel.Id;
                        data.StudentId = studentId;

                        if (updateEducationModel.StartDate) {
                            if (education.StartDate) {
                                var currentStartDate = new Date(education.StartDate);
                                if (updateEducationModel.StartDate.getTime() != currentStartDate.getTime()) {
                                    data.StartDate = updateEducationModel.StartDate.toDateString();
                                }
                            } else {
                                data.StartDate = updateEducationModel.StartDate.toDateString();
                            }
                        }

                        if (updateEducationModel.EndDate) {
                            if (education.EndDate) {
                                var currentEndDate = new Date(education.EndDate);
                                if (updateEducationModel.EndDate.getTime() != currentEndDate.getTime()) {
                                    data.EndDate = updateEducationModel.EndDate.toDateString();
                                }
                            } else {
                                data.EndDate = updateEducationModel.EndDate.toDateString();
                            }
                        }

                        if (updateEducationModel.DegreeDate) {
                            if (education.DegreeDate) {
                                var currentDegreeDate = new Date(education.DegreeDate);
                                if (updateEducationModel.DegreeDate.getTime() != currentDegreeDate.getTime()) {
                                    data.DegreeDate = updateEducationModel.DegreeDate.toDateString();
                                }
                            } else {
                                data.DegreeDate = updateEducationModel.DegreeDate.toDateString();
                            }
                        }

                        if (updateEducationModel.Institution !== education.Institution) {
                            data.Institution = updateEducationModel.Institution;
                        }

                        if (updateEducationModel.Location !== education.Location) {
                            data.Location = updateEducationModel.Location;
                        }

                        if (updateEducationModel.Degree !== education.Degree) {
                            data.Degree = updateEducationModel.Degree;
                        }

                        if (updateEducationModel.GPA !== Number(education.GPA)) {
                            data.GPA = updateEducationModel.GPA;
                        }

                        api.post('/api/educationupdate', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Education entry update successful.'
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
        Remove Education Entry
         */
        $scope.removeEducation = function (id) {
            api.getCSRF().then(function (response) {
                var csrf_token = response.data.value;
                var data = {};
                data.csrf_token = csrf_token;
                data.Id = id;
                api.post('/api/educationdelete', data).then(function (response) {
                    loadStudentPage();
                    global.showAlert({
                        type: 'success',
                        msg: 'Removed education entry successfully.'
                    });
                }, function (response) {
                    global.showAlert({
                        type: 'danger',
                        msg: response.data.message
                    });
                });
            });
        };


        /*
         * Modal: Add to Test Scores
         */
        $scope.addTestScore = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/addTestScoreForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    }),
                    testTypeOptions: function () { return helper.getTestTypeOptions() }
                },
                controller: function ($uibModalInstance, $scope, csrf_token, testTypeOptions) {

                    $scope.testScoreFields = [
                        {
                            key: 'testType',
                            type: 'select',
                            templateOptions: {
                                label: 'Select the type of test: ',
                                options: testTypeOptions,
                                required: true
                            }
                        },
                        {
                            key: 'Date',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Test Date: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'TotalScore',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Total Score: ',
                                minlength: 2,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'TotalPercent',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Total Percent: ',
                                minlength: 2,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'Verbal',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Verbal Score: ',
                                minlength: 2,
                                maxlength: 50
                            },
                            hideExpression: 'model.testType !== "GMAT" && model.testType !== "GRE"'
                        },
                        {
                            key: 'Quantitative',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Quantitative Score: ',
                                minlength: 2,
                                maxlength: 50
                            },
                            hideExpression: 'model.testType !== "GMAT" && model.testType !== "GRE"'
                        },
                        {
                            key: 'Written',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Written Score: ',
                                minlength: 2,
                                maxlength: 50
                            },
                            hideExpression: 'model.testType !== "GMAT" && model.testType !== "GRE"'
                        }
                    ];

                    $scope.submitTestScore = function (testScoreModel) {
                        var data = {};
                        angular.copy(testScoreModel, data);
                        data.csrf_token = csrf_token;
                        data.StudentId = $scope.studentData.Id;

                        if (data.Date) {
                            data.Date = data.Date.toDateString();
                        }

                        api.post('/api/addtestscore', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Test score added successfully.'
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
         * Modal: Update a Test Score
         */
        $scope.updateTestScore = function (testScore, testType) {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updateTestScoreForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    }),
                    testTypeOptions: function () { return helper.getTestTypeOptions() }
                },
                controller: function ($uibModalInstance, $scope, csrf_token, testTypeOptions) {

                    $scope.updateTestScoreModel = {};

                    angular.copy(testScore, $scope.updateTestScoreModel);
                    $scope.updateTestScoreModel.testType = testType;

                    if ($scope.updateTestScoreModel.Date) {
                        $scope.updateTestScoreModel.Date = new Date($scope.updateTestScoreModel.Date);
                    }

                    $scope.updateTestScoreFields = [
                        {
                            key: 'testType',
                            type: 'select',
                            templateOptions: {
                                label: 'Select the type of test: ',
                                options: testTypeOptions,
                                disabled: true
                            }
                        },
                        {
                            key: 'Date',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Test Date: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'TotalScore',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Total Score: ',
                                minlength: 2,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'TotalPercent',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Total Percent: ',
                                minlength: 2,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'Verbal',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Verbal Score: ',
                                minlength: 2,
                                maxlength: 50
                            },
                            hideExpression: 'model.testType !== "GMAT" && model.testType !== "GRE"'
                        },
                        {
                            key: 'Quantitative',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Quantitative Score: ',
                                minlength: 2,
                                maxlength: 50
                            },
                            hideExpression: 'model.testType !== "GMAT" && model.testType !== "GRE"'
                        },
                        {
                            key: 'Written',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Written Score: ',
                                minlength: 2,
                                maxlength: 50
                            },
                            hideExpression: 'model.testType !== "GMAT" && model.testType !== "GRE"'
                        }
                    ];

                    $scope.submitTestScoreUpdate = function (updatedScore) {
                        var data = {};
                        data.csrf_token = csrf_token;
                        data.StudentId = $scope.studentData.Id;
                        data.testType = updatedScore.testType;
                        data.Id = updatedScore.Id;
                        //Determine if date is being updated.
                        if (updatedScore.Date) {
                            if(testScore.Date){
                                var currentTestScoreDate = new Date(testScore.Date);
                                if(updatedScore.Date.getTime() != currentTestScoreDate.getTime()){
                                    data.Date = updatedScore.Date.toDateString();
                                }
                            }else{
                                data.Date = updatedScore.Date.toDateString();
                            }
                        }
                        //Determine if total score is being updated.
                        if(updatedScore.TotalScore){
                            if(testScore.TotalScore){
                                if(updatedScore.TotalScore != testScore.TotalScore){
                                    data.TotalScore = updatedScore.TotalScore;
                                }
                            }else{
                                data.TotalScore = updatedScore.TotalScore;
                            }
                        }
                        //Determine if total percent is being updated.
                        if(updatedScore.TotalPercent){
                            if(testScore.TotalPercent){
                                if(updatedScore.TotalPercent != testScore.TotalPercent){
                                    data.TotalPercent = updatedScore.TotalPercent;
                                }
                            }else{
                                data.TotalPercent = updatedScore.TotalPercent;
                            }
                        }
                        //Determine if verbal is being updated.
                        if(updatedScore.Verbal){
                            if(testScore.Verbal){
                                if(updatedScore.Verbal != testScore.Verbal){
                                    data.Verbal = updatedScore.Verbal;
                                }
                            }else{
                                data.Verbal = updatedScore.Verbal;
                            }
                        }
                        //Determine if quantitative is being updated.
                        if(updatedScore.Quantitative){
                            if(testScore.Quantitative){
                                if(updatedScore.Quantitative != testScore.Quantitative){
                                    data.Quantitative = updatedScore.Quantitative;
                                }
                            }else{
                                data.Quantitative = updatedScore.Quantitative;
                            }
                        }
                        //Determine if written is being updated.
                        if(updatedScore.Written){
                            if(testScore.Written){
                                if(updatedScore.Written != testScore.Written){
                                    data.Written = updatedScore.Written;
                                }
                            }else{
                                data.Written = updatedScore.Written;
                            }
                        }
   

                        api.post('/api/updatetestscore', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Test score updated successfully.'
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
        Remove Test Entry
         */
        $scope.removeTestScore = function (id, testType) {
            api.getCSRF().then(function (response) {
                var csrf_token = response.data.value;
                var data = {};
                data.csrf_token = csrf_token;
                data.Id = id;
                data.testType = testType;
                api.post('/api/testscoredelete', data).then(function (response) {
                    loadStudentPage();
                    global.showAlert({
                        type: 'success',
                        msg: 'Test score removed successfully.'
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