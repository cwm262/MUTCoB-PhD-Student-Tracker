(function() {
    'use strict';

    angular
        .module('angularApp')
        .controller('ProgramTabController', ProgramTabController);

    ProgramTabController.$inject = ['$scope', '$uibModal', 'api', 'helper', '$stateParams', '$location', 'global', 'baseUrl'];

    function ProgramTabController($scope, $uibModal, api, helper, $stateParams, $location, global, baseUrl){
        //Get student ID from URL parameter
        var studentId = $stateParams.studentId;

        $scope.baseUrl = baseUrl;

        //LOAD ALL STUDENT DATA
        function loadStudentPage() {
            api.getById('/api/student', studentId).then(function (response) {

                //Set scope variable studentData to response data
                $scope.studentData = response.data[0];

                api.getByIdAndParam('/api/requiredForms', studentId, 'DForm').then(function(response){
                    $scope.dissertations = response.data;
                })
                api.getByIdAndParam('/api/requiredForms', studentId, 'CSub').then(function(response){
                    $scope.csubs = response.data;
                })
                api.getByIdAndParam('/api/requiredForms', studentId, 'CoC').then(function(response){
                    $scope.cocs = response.data;
                })
                api.getByIdAndParam('/api/requiredForms', studentId, 'Misc').then(function(response){
                    $scope.miscs = response.data;
                })
                api.getById('/api/committeechairs', studentId).then(function(response){
                    $scope.committeeChairs = response.data;
                })
                api.getById('/api/committeemembers', studentId).then(function(response){
                    $scope.committeeMembers = response.data;
                })
                api.getById('/api/outsidecommittee', studentId).then(function(response){
                    $scope.outsideCommitteeMembers = response.data;
                })

            }, function (response) {
                $location.url('/404');
            });
        }

        loadStudentPage();

        /*
        * Modal: Update Program Info.
        */
        $scope.updateProgram = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updateProgramForm.html',
                resolve: {
                    semesterOptions: function () { return helper.getSemesterOptions(); },
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    })
                },
                controller: function ($uibModalInstance, $scope, semesterOptions, csrf_token) {
                    $scope.program = {};
                    angular.copy($scope.studentData, $scope.program);

                    if ($scope.program.VerificationDate) {
                        $scope.program.VerificationDate = new Date($scope.program.VerificationDate);
                    }
                    if ($scope.program.FundingBegins) {
                        $scope.program.FundingBegins = new Date($scope.program.FundingBegins);
                    }
                    if ($scope.program.FundingEnd) {
                        $scope.program.FundingEnd = new Date($scope.program.FundingEnd);
                    }
                    if ($scope.program.ComprehensiveExamPassedDate) {
                        $scope.program.ComprehensiveExamPassedDate = new Date($scope.program.ComprehensiveExamPassedDate);
                    }
                    if ($scope.program.HoursCompleted) {
                        $scope.program.HoursCompleted = Number($scope.program.HoursCompleted);
                    }

                    $scope.programFields = [
                        {
                            key: 'SemesterVerified',
                            type: 'select',
                            templateOptions: {
                                label: 'Semester Verified: ',
                                options: semesterOptions
                            }
                        },
                        {
                            key: 'HoursCompleted',
                            type: 'input',
                            templateOptions: {
                                label: 'Hours Completed: ',
                                type: 'number'
                            }
                        },
                        {
                            key: 'VerificationDate',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Semester Hours Verified: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'StartingSemester',
                            type: 'select',
                            templateOptions: {
                                label: 'First Semester in Program: ',
                                options: semesterOptions
                            }
                        },
                        {
                            key: 'FundingBegins',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Funding Begins: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'FundingEnd',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Funding End: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'ComprehensiveExamPassedDate',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Comprehensive Exam Passed: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },

                    ];

                    $scope.submitProgram = function (program) {
                        var data = {};
                        data.csrf_token = csrf_token;
                        data.Id = program.Id;
                        if (program.SemesterVerified !== $scope.studentData.SemesterVerified) {
                            data.SemesterVerified = program.SemesterVerified;
                        }
                        if(program.HoursCompleted){
                            if($scope.studentData.HoursCompleted){
                                var currentHoursCompleted = Number($scope.studentData.HoursCompleted);
                                if(program.HoursCompleted != currentHoursCompleted){
                                    data.HoursCompleted = program.HoursCompleted;
                                }
                            }else{
                                data.HoursCompleted = program.HoursCompleted;
                            }
                        }

                        if (program.VerificationDate) {
                            if ($scope.studentData.VerificationDate) {
                                var currentVerificationDate = new Date($scope.studentData.VerificationDate);
                                if (program.VerificationDate.getTime() != currentVerificationDate.getTime()) {
                                    data.VerificationDate = program.VerificationDate.toDateString();
                                }
                            } else {
                                data.VerificationDate = program.VerificationDate.toDateString();
                            }
                        }

                        if (program.StartingSemester !== $scope.studentData.StartingSemester) {
                            data.StartingSemester = program.StartingSemester;
                        }

                        if (program.FundingBegins) {
                            if ($scope.studentData.FundingBegins) {
                                var currentFundingBegins = new Date($scope.studentData.FundingBegins);
                                if (program.FundingBegins.getTime() != currentFundingBegins.getTime()) {
                                    data.FundingBegins = program.FundingBegins.toDateString();
                                }
                            } else {
                                data.FundingBegins = program.FundingBegins.toDateString();
                            }
                        }

                        if (program.FundingEnd) {
                            if ($scope.studentData.FundingEnd) {
                                var currentFundingEnd = new Date($scope.studentData.FundingEnd);
                                if (program.FundingEnd.getTime() != currentFundingEnd.getTime()) {
                                    data.FundingEnd = program.FundingEnd.toDateString();
                                }
                            } else {
                                data.FundingEnd = program.FundingEnd.toDateString();
                            }
                        }

                        if (program.ComprehensiveExamPassedDate) {
                            if ($scope.studentData.ComprehensiveExamPassedDate) {
                                var currentComprehensiveExamPassedDate = new Date($scope.studentData.ComprehensiveExamPassedDate);
                                if (program.ComprehensiveExamPassedDate.getTime() != currentComprehensiveExamPassedDate.getTime()) {
                                    data.ComprehensiveExamPassedDate = program.ComprehensiveExamPassedDate.toDateString();
                                }
                            } else {
                                data.ComprehensiveExamPassedDate = program.ComprehensiveExamPassedDate.toDateString();
                            }
                        }

                        api.post('/api/updatestudentinfo', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Program update successful.'
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
        * Modal: Update Graduation and Placement
        */
        $scope.updateGradAndPlacement = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updateGradAndPlacementForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    })
                },
                controller: function ($uibModalInstance, $scope, csrf_token) {
                    $scope.gradAndPlacementModel = {};
                    angular.copy($scope.studentData, $scope.gradAndPlacementModel);

                    if ($scope.gradAndPlacementModel.ExpectedGraduationDate) {
                        $scope.gradAndPlacementModel.ExpectedGraduationDate = new Date($scope.gradAndPlacementModel.ExpectedGraduationDate);
                    }

                    if ($scope.gradAndPlacementModel.GraduationDate) {
                        $scope.gradAndPlacementModel.GraduationDate = new Date($scope.gradAndPlacementModel.GraduationDate);
                    }

                    $scope.gradAndPlacementFields = [
                        {
                            key: 'PlacementLocation',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Location of Initial Placement: ',
                                minlength: 3,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'ExpectedGraduationDate',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Expected Graduation Date: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'GraduationDate',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Expected Graduation Date: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        }
                    ];

                    $scope.submitGradAndPlacement = function (gradAndPlacementModel) {
                        var data = {};
                        data.csrf_token = csrf_token;
                        data.Id = gradAndPlacementModel.Id;
                        if (gradAndPlacementModel.PlacementLocation !== $scope.studentData.PlacementLocation) {
                            data.PlacementLocation = gradAndPlacementModel.PlacementLocation;
                        }
                        if (gradAndPlacementModel.ExpectedGraduationDate !== $scope.studentData.ExpectedGraduationDate) {
                            data.ExpectedGraduationDate = gradAndPlacementModel.ExpectedGraduationDate.toDateString();
                        }
                        if (gradAndPlacementModel.GraduationDate !== $scope.studentData.GraduationDate) {
                            data.GraduationDate = gradAndPlacementModel.GraduationDate.toDateString();
                        }
                        api.post('/api/updatestudentinfo', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Graduation and placement update successful.'
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
         MODAL: Add Required Form
         */
        $scope.addForm = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/uploadRequiredForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    }),
                    typeOptions: function () { return helper.getRequiredFormTypeOptions() },
                    dissertationOptions: function (){ return helper.getDissertationNumberOptions() }
                },
                controller: function ($uibModalInstance, $scope, csrf_token, typeOptions, dissertationOptions) {

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

                    $scope.dissertationOptions = dissertationOptions;

                    $scope.submitRequiredForm = function (fileToUpload, submissionDate, formType, dissertationNumber, dissertationApproved) {
                        var data = {};
                        function assignData() {
                            data.StudentId = $scope.studentData.Id;
                            data.csrf_token = csrf_token;
                            if (submissionDate) {
                                data.SubmitDate = new Date(submissionDate);
                                data.SubmitDate = data.SubmitDate.toDateString();
                            }
                            data.FileType = formType.value;
                            if (dissertationNumber) {
                                data.DFormType = dissertationNumber.value;
                            }
                            if (dissertationApproved) {
                                data.DissertationApproved = dissertationApproved;
                            }

                            
                        }
                        assignData();
                        api.uploadFile(fileToUpload, '/api/uploadrequiredform', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Required form added successfully.'
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
         * Modal: Update Required Form
         */
        $scope.updateForm = function (form, formType) {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updateRequiredForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    }),
                    dissertationOptions: function () { return helper.getDissertationNumberOptions() }
                },
                controller: function ($uibModalInstance, $scope, csrf_token, dissertationOptions) {

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

                    $scope.dissertationOptions = dissertationOptions;

                    $scope.updateReqFormModel = {};

                    angular.copy(form, $scope.updateReqFormModel);

                    $scope.formType = formType;

                    if ($scope.updateReqFormModel.DFormType) {
                        $scope.updateReqFormModel.DFormType = Number($scope.updateReqFormModel.DFormType);
                    }

                    $scope.updateReqFormModel.DissertationApproved = ($scope.updateReqFormModel.DissertationApproved == "true");

                    if ($scope.updateReqFormModel.SubmitDate) {
                        $scope.updateReqFormModel.SubmitDate = new Date($scope.updateReqFormModel.SubmitDate);
                    }

                    $scope.submitUpdatedForm = function (fileToUpload, updateReqFormModel) {
                        var data = {};
                        function assignData() {
                            data.ID = updateReqFormModel.ID;
                            data.StudentId = studentId;
                            data.csrf_token = csrf_token;
                            data.FileType = formType;

                            if ($scope.declineCheckBox == true) {
                                data.ReasonForDecline = updateAdmissionOfferModel.ReasonForDecline;
                            }

                            if (updateReqFormModel.PDFName) {
                                data.PDFName = updateReqFormModel.PDFName;
                            }

                            if (updateReqFormModel.SubmitDate) {
                                if (form.SubmitDate) {
                                    var currentSubmitDate = new Date(form.SubmitDate);
                                    if (updateReqFormModel.SubmitDate.getTime() != currentSubmitDate.getTime()) {
                                        data.SubmitDate = updateReqFormModel.SubmitDate.toDateString();
                                    }
                                } else {
                                    data.SubmitDate = updateReqFormModel.SubmitDate.toDateString();
                                }
                            }

                            if (updateReqFormModel.DFormType !== null) {
                                if (form.DFormType !== "null" || form.DFormType !== null) {
                                    var currentFormType = Number(form.DFormType);
                                    if (updateReqFormModel.DFormType != currentFormType) {
                                        data.DFormType = updateReqFormModel.DFormType;
                                    }
                                } else {
                                    data.DFormType = updateReqFormModel.DFormType;
                                }
                            }


                            if(updateReqFormModel.DissertationApproved != (form.DissertationApproved == "true")){
                                data.DissertationApproved = updateReqFormModel.DissertationApproved;
                            }

                        }
                        assignData();
                        api.uploadFile(fileToUpload, '/api/updaterequiredform', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Required form updated successfully.'
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
        Remove/Delete Required Form
        */
        $scope.removeForm = function (form) {
            api.getCSRF().then(function (response) {
                var csrf_token = response.data.value;
                var data = {};
                data.csrf_token = csrf_token;
                data.StudentId = form.StudentId;
                data.ID = form.ID;
                data.PDFName = form.PDFName;
                data.FileType = form.FileType;
                api.post('/api/deleterequiredform', data).then(function (response) {
                    loadStudentPage();
                    global.showAlert({
                        type: 'success',
                        msg: 'Required form removed successfully.'
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
         * Modal: Add Committee Member Form
         */
        $scope.addCommitteeMember = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/addCommitteeForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    }),
                    memberTypeOptions: function (){return helper.getCommitteeMemberTypeOptions()}
                },
                controller: function ($uibModalInstance, $scope, csrf_token, memberTypeOptions) {

                    $scope.committeeFields = [
                        {
                            key: 'MemberType',
                            type: 'select',
                            templateOptions: {
                                label: 'Member type: ',
                                options: memberTypeOptions,
                                required: true
                            }
                        },
                        {
                            key: 'DissertationTitle',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Dissertation Title: ',
                                placeholder: 'e.g., "The impact of corporate governance on earnings management for periods pre and post financial crises."',
                                minlength: 3,
                                maxlength: 140
                            }
                        },
                        {
                            key: 'DefendedDate',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Defended Date: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'MemberName',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Member Name: (first, last)',
                                placeholder: 'e.g., Daniel Boone',
                                minlength: 3,
                                maxlength: 140,
                                required: true
                            }
                        },
                        {
                            key: 'MemberDepartment',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Member Department: ',
                                placeholder: 'e.g., Accounting',
                                minlength: 3,
                                maxlength: 140
                            }
                        }
                    ];

                    $scope.submitCommittee = function (committeeModel) {
                        var data = {};
                        angular.copy(committeeModel, data);
                        data.csrf_token = csrf_token;
                        data.StudentId = $scope.studentData.Id;

                        if (data.DefendedDate) {
                            data.DefendedDate = data.DefendedDate.toDateString();
                        }

                        api.post('/api/addcommittee', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Committee member added successfully.'
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
         * Modal: Update Committee Form
         */
        $scope.updateCommittee = function (committeeMember) {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updateCommitteeForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    }),
                    memberTypeOptions: function(){return helper.getCommitteeMemberTypeOptions()}
                },
                controller: function ($uibModalInstance, $scope, csrf_token, memberTypeOptions) {

                    $scope.updateCommitteeModel = {};
                    angular.copy(committeeMember, $scope.updateCommitteeModel);

                    if ($scope.updateCommitteeModel.DefendedDate) {
                        $scope.updateCommitteeModel.DefendedDate = new Date($scope.updateCommitteeModel.DefendedDate);
                    }

                    $scope.updateCommitteeFields = [
                        {
                            key: 'MemberType',
                            type: 'select',
                            templateOptions: {
                                label: 'Member type: ',
                                options: memberTypeOptions,
                                disabled: true
                            }
                        },
                        {
                            key: 'DissertationTitle',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Dissertation Title: ',
                                placeholder: 'e.g., "The impact of corporate governance on earnings management for periods pre and post financial crises."',
                                minlength: 3,
                                maxlength: 140
                            }
                        },
                        {
                            key: 'DefendedDate',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Defended Date: ',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'MemberName',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Member Name: (first, last)',
                                placeholder: 'e.g., Daniel Boone',
                                minlength: 3,
                                maxlength: 140,
                                required: true
                            }
                        },
                        {
                            key: 'MemberDepartment',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Member Department: ',
                                placeholder: 'e.g., Accounting',
                                minlength: 3,
                                maxlength: 140
                            }
                        }
                    ];

                    $scope.submitCommitteeUpdate = function (updateCommitteeModel) {
                        var data = {};
                        data.csrf_token = csrf_token;
                        data.Id = updateCommitteeModel.Id;
                        data.StudentId = studentId;

                        if (updateCommitteeModel.DefendedDate) {
                            if (committeeMember.DefendedDate) {
                                var currDate = new Date(committeeMember.DefendedDate);
                                if (updateCommitteeModel.DefendedDate.getTime() != currDate.getTime()) {
                                    data.DefendedDate = updateCommitteeModel.DefendedDate.toDateString();
                                }
                            } else {
                                data.DefendedDate = updateCommitteeModel.DefendedDate.toDateString();
                            }
                        }

                        if(updateCommitteeModel.DissertationTitle !== committeeMember.DissertationTitle){
                            data.DissertationTitle = updateCommitteeModel.DissertationTitle;
                        }
                        if(updateCommitteeModel.MemberName !== committeeMember.MemberName){
                            data.MemberName = updateCommitteeModel.MemberName;
                        }
                        if(updateCommitteeModel.MemberDepartment !== committeeMember.MemberDepartment){
                            data.MemberDepartment = updateCommitteeModel.MemberDepartment;
                        }

                        api.post('/api/updatecommittee', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Committee member updated successfully.'
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
        Remove/Delete Committee Member
        */
        $scope.removeCommittee = function (committeeMember) {
            api.getCSRF().then(function (response) {
                var csrf_token = response.data.value;
                var data = {};
                data.csrf_token = csrf_token;
                data.Id = committeeMember.Id;
                api.post('/api/removecommittee', data).then(function (response) {
                    loadStudentPage();
                    global.showAlert({
                        type: 'success',
                        msg: 'Committee member removed successfully.'
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