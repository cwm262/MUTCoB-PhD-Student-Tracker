(function() {
    'use strict';

    angular
        .module('angularApp')
        .controller('GeneralTabController', GeneralTabController);

    GeneralTabController.$inject = ['$scope', '$uibModal', 'api', 'helper', '$stateParams', '$location', 'global', 'baseUrl'];

    function GeneralTabController($scope, $uibModal, api, helper, $stateParams, $location, global, baseUrl){
        //Get student ID from URL parameter
        var studentId = $stateParams.studentId;

        $scope.baseUrl = baseUrl;

        //LOAD ALL STUDENT DATA
        function loadStudentPage() {
            api.getById('/api/student', studentId).then(function (response) {

                //Set scope variable studentData to response data
                $scope.studentData = response.data[0];

                var getters = helper.getGeneralTabGetters();

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
        MODAL: Update Basic Information
        */
        $scope.updateBasic = function () {
            
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updateBasicInformationModal.html',
                resolve: {
                    programOptions: function () { return helper.getProgramOptions() },
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    })
                },
                controller: function ($uibModalInstance, $scope, programOptions, csrf_token) {

                    $scope.basicInfo = {};
                    angular.copy($scope.studentData, $scope.basicInfo);

                    $scope.updateBasicInfoFormFields = [
                        {
                            key: 'StudentNumber',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Student Number: ',
                                minlength: 3,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'LastName',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Last Name: ',
                                minlength: 2,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'FirstName',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'First Name: ',
                                minlength: 2,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'MiddleName',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Middle Name: ',
                                minlength: 1,
                                maxlength: 50
                            }
                        },
                        {
                            key: 'PawPrint',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Paw print: ',
                                minlength: 3,
                                maxlength: 12
                            }
                        },
                        {
                            key: 'Program',
                            type: 'select',
                            templateOptions: {
                                label: 'Program: ',
                                options: programOptions
                            }
                        }

                    ];

                    $scope.submitBasicInfo = function (basicInfo) {
                        var data = {};
                        data.csrf_token = csrf_token;
                        data.Id = $scope.studentData.Id;
                        if (basicInfo.StudentNumber !== $scope.studentData.StudentNumber) {
                            data.StudentNumber = basicInfo.StudentNumber;
                        }
                        if (basicInfo.LastName !== $scope.studentData.LastName) {
                            data.LastName = basicInfo.LastName;
                        }
                        if (basicInfo.FirstName !== $scope.studentData.FirstName) {
                            data.FirstName = basicInfo.FirstName;
                        }
                        if (basicInfo.MiddleName !== $scope.studentData.MiddleName) {
                            data.MiddleName = basicInfo.MiddleName;
                        }
                        if (basicInfo.PawPrint !== $scope.studentData.PawPrint) {
                            data.PawPrint = basicInfo.PawPrint;
                        }
                        if (basicInfo.Program !== $scope.studentData.Program) {
                            data.Program = basicInfo.Program;
                        }
                        api.post('/api/updatestudentinfo', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Basic information update successful.'
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
        MODAL: Update Student Status
         */
        $scope.updateStatus = function () {
            
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updateStatusModal.html',
                resolve: {
                    statusOptions: function () { return helper.getStatusOptions() },
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    })
                },
                controller: function ($uibModalInstance, $scope, statusOptions, csrf_token) {

                    $scope.status = {};
                    $scope.status.PhDStatus = $scope.studentData.PhDStatus;

                    $scope.updateStatusFields = [
                        {
                            key: 'PhDStatus',
                            type: 'select',
                            templateOptions: {
                                label: 'Status: ',
                                options: statusOptions
                            }
                        }
                    ];

                    $scope.submitUpdateStatus = function (status) {
                        var data = {};
                        data.csrf_token = csrf_token;
                        data.Id = $scope.studentData.Id;
                        data.PhDStatus = status.PhDStatus;
                        api.post('/api/updatestatus', data).then(function (response) {
                            loadStudentPage();
                            $uibModalInstance.close();
                            global.showAlert({
                                type: 'success',
                                msg: 'Status update successful.'
                            });
                        }, function (response) {
                            $scope.message = response.statusText;
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
         MODAL: Add Admission Form
         */
        $scope.addOffer = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/uploadAdmissionForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    })
                },
                controller: function ($uibModalInstance, $scope, csrf_token) {

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

                    $scope.datepicker2 = {};

                    $scope.datepicker2.opened = false;

                    $scope.datepicker2.open = function ($event) {
                        $scope.datepicker2.opened = !$scope.datepicker2.opened;
                    };

                    /***/

                    $scope.datepicker3 = {};

                    $scope.datepicker3.opened = false;

                    $scope.datepicker3.open = function ($event) {
                        $scope.datepicker3.opened = !$scope.datepicker3.opened;
                    };

                    /***/

                    $scope.declineCheckBox = false;

                    $scope.submitAdmissionForm = function (fileToUpload, reasonForDecline, offerDate, applicationDate, campusVisitDate) {
                        var data = {};
                        function assignData() {
                            data.StudentId = $scope.studentData.Id;
                            data.csrf_token = csrf_token;
                            if ($scope.declineCheckBox == true) {
                                data.ReasonForDecline = reasonForDecline;
                            }
                            if (offerDate != null) {
                                data.OfferDate = offerDate.toDateString();
                            }
                            if (applicationDate != null) {
                                data.ApplicationDate = applicationDate.toDateString();
                            }
                            if (campusVisitDate != null) {
                                data.CampusVisitDate = campusVisitDate.toDateString();
                            }
                        }
                        assignData();
                        api.uploadFile(fileToUpload, '/api/uploadadmissionoffer', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Admission offer added.'
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
         * Modal: Update Admission Offer Form 
         */
        $scope.updateAdmissionOffer = function (admissionOfferModel) {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updateAdmissionForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    })
                },
                controller: function ($uibModalInstance, $scope, csrf_token) {

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

                    $scope.datepicker2 = {};

                    $scope.datepicker2.opened = false;

                    $scope.datepicker2.open = function ($event) {
                        $scope.datepicker2.opened = !$scope.datepicker2.opened;
                    };

                    /***/

                    $scope.datepicker3 = {};

                    $scope.datepicker3.opened = false;

                    $scope.datepicker3.open = function ($event) {
                        $scope.datepicker3.opened = !$scope.datepicker3.opened;
                    };

                    /***/

                    $scope.updateAdmissionOfferModel = {};

                    angular.copy(admissionOfferModel, $scope.updateAdmissionOfferModel);

                    $scope.showYourFileWillBeRemoved = false;

                    if ($scope.updateAdmissionOfferModel.Attachment) {
                        $scope.showRemoveButton = true;
                    }

                    $scope.removeAttachment = function () {
                        $scope.showRemoveButton = false;
                        $scope.showYourFileWillBeRemoved = true;
                        $scope.updateAdmissionOfferModel.deleteFileOnRecord = true;
                    }


                    if ($scope.updateAdmissionOfferModel.OfferDate) {
                        $scope.updateAdmissionOfferModel.OfferDate = new Date($scope.updateAdmissionOfferModel.OfferDate);
                    }
                    if ($scope.updateAdmissionOfferModel.ApplicationDate) {
                        $scope.updateAdmissionOfferModel.ApplicationDate = new Date($scope.updateAdmissionOfferModel.ApplicationDate);
                    }
                    if ($scope.updateAdmissionOfferModel.CampusVisitDate) {
                        $scope.updateAdmissionOfferModel.CampusVisitDate = new Date($scope.updateAdmissionOfferModel.CampusVisitDate);
                    }
                    $scope.declineCheckBox = !!$scope.updateAdmissionOfferModel.ReasonForDecline;

                    $scope.submitUpdateAdmissionForm = function (fileToUpload, updateAdmissionOfferModel) {
                        var data = {};
                        function assignData() {
                            data.Id = updateAdmissionOfferModel.Id;
                            data.StudentId = $scope.studentData.Id;
                            data.csrf_token = csrf_token;

                            if ($scope.declineCheckBox == true) {
                                data.ReasonForDecline = updateAdmissionOfferModel.ReasonForDecline;
                            }

                            if (updateAdmissionOfferModel.deleteFileOnRecord) {
                                data.deleteFileOnRecord = true;
                                data.Attachment = updateAdmissionOfferModel.Attachment;
                            }

                            if (updateAdmissionOfferModel.OfferDate) {
                                if (admissionOfferModel.OfferDate) {
                                    var currentOfferDate = new Date(admissionOfferModel.OfferDate);
                                    if (updateAdmissionOfferModel.OfferDate.getTime() != currentOfferDate.getTime()) {
                                        data.OfferDate = updateAdmissionOfferModel.OfferDate.toDateString();
                                    }
                                } else {
                                    data.OfferDate = updateAdmissionOfferModel.OfferDate.toDateString();
                                }
                            }

                            if (updateAdmissionOfferModel.ApplicationDate) {
                                if (admissionOfferModel.ApplicationDate) {
                                    var currentApplicationDate = new Date(admissionOfferModel.ApplicationDate);
                                    if (updateAdmissionOfferModel.ApplicationDate.getTime() != currentApplicationDate.getTime()) {
                                        data.ApplicationDate = updateAdmissionOfferModel.ApplicationDate.toDateString();
                                    }
                                } else {
                                    data.ApplicationDate = updateAdmissionOfferModel.ApplicationDate.toDateString();
                                }
                            }

                            if (updateAdmissionOfferModel.CampusVisitDate) {
                                if (admissionOfferModel.CampusVisitDate) {
                                    var currentCampusVisitDate = new Date(admissionOfferModel.CampusVisitDate);
                                    if (updateAdmissionOfferModel.CampusVisitDate.getTime() != currentCampusVisitDate.getTime()) {
                                        data.CampusVisitDate = updateAdmissionOfferModel.CampusVisitDate.toDateString();
                                    }
                                } else {
                                    data.CampusVisitDate = updateAdmissionOfferModel.CampusVisitDate.toDateString();
                                }
                            }

                        }
                        assignData();
                        api.uploadFile(fileToUpload, '/api/updateadmissionoffer', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Admission offer update successful.'
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
        Remove/Delete Admission Offer
         */
        $scope.removeAdmissionOffer = function (admissionOffer) {
            api.getCSRF().then(function (response) {
                var csrf_token = response.data.value;
                var data = {};
                data.csrf_token = csrf_token;
                data.StudentId = admissionOffer.StudentId;
                data.Id = admissionOffer.Id;
                data.Attachment = admissionOffer.Attachment;
                api.post('/api/deleteadmissionoffer', data).then(function (response) {
                    loadStudentPage();
                    global.showAlert({
                        type: 'success',
                        msg: 'Admission offer deleted.'
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
         * Modal: Update Permanent Address Form
         */
        $scope.updatePermanentAddress = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updatePermanentAddressForm.html',
                resolve: {
                    countryOptions: api.getAll('/assets/js/other/countries.json').then(function (response) {
                        return response.data;
                    }),
                    stateOptions: api.getAll('/assets/js/other/us_states.json').then(function (response) {
                        return response.data;
                    }),
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    })
                },
                controller: function ($uibModalInstance, $scope, countryOptions, stateOptions, csrf_token) {
                    $scope.permanentAddress = {};
                    angular.copy($scope.studentData, $scope.permanentAddress);

                    $scope.permanentAddress.addOtherField = !!$scope.permanentAddress.PermanentOtherInfo;

                    $scope.permanentAddressFields = [
                        {
                            key: 'PermanentCountry',
                            type: 'select',
                            templateOptions: {
                                label: 'Country: ',
                                options: countryOptions
                            }
                        },
                        {
                            key: 'PermanentState',
                            type: 'select',
                            templateOptions: {
                                label: 'State: ',
                                options: stateOptions
                            },
                            hideExpression: "model.PermanentCountry != 'US'"
                        },
                        {
                            key: 'addOtherField',
                            type: 'checkbox',
                            templateOptions: {
                                label: 'Add other information'
                            }
                        },
                        {
                            key: 'PermanentOtherInfo',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Other pertinent information (e.g., province): ',
                                minlength: 3,
                                maxlength: 140
                            },
                            hideExpression: '!model.addOtherField'
                        },
                        {
                            key: 'PermanentAddress',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Street: ',
                                minlength: 6,
                                maxlength: 140
                            }
                        },
                        {
                            key: 'PermanentCity',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'City: ',
                                minlength: 3,
                                maxlength: 140
                            }
                        },
                        {
                            key: 'PermanentZipCode',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Postal Code: ',
                                minlength: 4,
                                maxlength: 30
                            }
                        }
                    ];

                    $scope.submitPermamentAddress = function (permanentAddress) {
                        var data = {};
                        data.csrf_token = csrf_token;
                        data.Id = permanentAddress.Id;
                        if (permanentAddress.PermanentCountry !== $scope.studentData.PermanentCountry) {
                            data.PermanentCountry = permanentAddress.PermanentCountry;
                        }
                        if (permanentAddress.PermanentState !== $scope.studentData.PermanentState) {
                            data.PermanentState = permanentAddress.PermanentState;
                        }
                        if(permanentAddress.addOtherField != true){
                            if (permanentAddress.PermanentOtherInfo) {
                                data.PermanentOtherInfo = null;
                            }
                        }
                        if (permanentAddress.PermanentOtherInfo !== $scope.studentData.PermanentOtherInfo){
                            data.PermanentOtherInfo = permanentAddress.PermanentOtherInfo;
                        }
                        if (permanentAddress.PermanentAddress !== $scope.studentData.PermanentAddress) {
                            data.PermanentAddress = permanentAddress.PermanentAddress;
                        }
                        if (permanentAddress.PermanentCity !== $scope.studentData.PermanentCity) {
                            data.PermanentCity = permanentAddress.PermanentCity;
                        }
                        if (permanentAddress.PermanentZipCode !== $scope.studentData.PermanentZipCode) {
                            data.PermanentZipCode = permanentAddress.PermanentZipCode;
                        }
                        api.post('/api/updatestudentinfo', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Permanent address update successful.'
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
         * Modal: Update Local Address Form
         */
        $scope.updateLocalAddress = function () {
            
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updateLocalAddressForm.html',
                resolve: {
                    stateOptions: api.getAll('/assets/js/other/us_states.json').then(function (response) {
                        return response.data;
                    }),
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    })
                },
                controller: function ($uibModalInstance, $scope, stateOptions, csrf_token) {

                    $scope.localAddress = {};
                    angular.copy($scope.studentData, $scope.localAddress);

                    $scope.localAddressFields = [
                        {
                            key: 'LocalState',
                            type: 'select',
                            templateOptions: {
                                label: 'State: ',
                                options: stateOptions
                            }
                        },
                        {
                            key: 'LocalAddress',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Street: ',
                                minlength: 6,
                                maxlength: 140
                            }
                        },
                        {
                            key: 'LocalCity',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'City: ',
                                minlength: 3,
                                maxlength: 140
                            }
                        },
                        {
                            key: 'LocalZipCode',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Postal Code: ',
                                minlength: 4,
                                maxlength: 30
                            }
                        }
                    ];

                    $scope.submitLocalAddress = function (localAddress) {
                        var data = {};
                        data.csrf_token = csrf_token;
                        data.Id = localAddress.Id;
                        if (localAddress.LocalState !== $scope.studentData.LocalState) {
                            data.LocalState = localAddress.LocalState;
                        }
                        if (localAddress.LocalAddress !== $scope.studentData.LocalAddress) {
                            data.LocalAddress = localAddress.LocalAddress;
                        }
                        if (localAddress.LocalCity !== $scope.studentData.LocalCity) {
                            data.LocalCity = localAddress.LocalCity;
                        }
                        if (localAddress.LocalZipCode !== $scope.studentData.LocalZipCode) {
                            data.LocalZipCode = localAddress.LocalZipCode;
                        }
                        api.post('/api/updatestudentinfo', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Local address update successful.'
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
         * Modal: Update Contact Information Form
         */
        $scope.updateContact = function () {
            
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updateContactForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    })
                },
                controller: function ($uibModalInstance, $scope, csrf_token) {

                    $scope.contact = {};
                    angular.copy($scope.studentData, $scope.contact);

                    $scope.contact.addPrimaryPhone = !!$scope.contact.PrimaryPhone;
                    $scope.contact.addSecondaryPhone = !!$scope.contact.SecondaryPhone;
                    $scope.contact.addWorkPhone = !!$scope.contact.WorkPhone;

                    $scope.contactFields = [
                        {
                            key: 'addPrimaryPhone',
                            type: 'checkbox',
                            templateOptions: {
                                label: 'Add Primary Phone?'
                            }
                        },
                        {
                            key: 'PrimaryPhone',
                            type: 'phone',
                            templateOptions: {
                                label: 'Primary Phone: '
                            },
                            hideExpression: '!model.addPrimaryPhone'
                        },
                        {
                            key: 'addSecondaryPhone',
                            type: 'checkbox',
                            templateOptions: {
                                label: 'Add Secondary Phone?'
                            }
                        },
                        {
                            key: 'SecondaryPhone',
                            type: 'phone',
                            templateOptions: {
                                label: 'Secondary Phone: '
                            },
                            hideExpression: '!model.addSecondaryPhone'
                        },
                        {
                            key: 'addWorkPhone',
                            type: 'checkbox',
                            templateOptions: {
                                label: 'Add Work Phone?'
                            }
                        },
                        {
                            key: 'WorkPhone',
                            type: 'phone',
                            templateOptions: {
                                label: 'Work Phone: '
                            },
                            hideExpression: '!model.addWorkPhone'
                        },
                        {
                            key: 'OfficeBuilding',
                            type: 'input',
                            templateOptions: {
                                type: 'text',
                                label: 'Office: '
                            }
                        },
                        {
                            key: 'PrimaryEmail',
                            type: 'input',
                            templateOptions: {
                                type: 'email',
                                label: 'Primary Email: '
                            }
                        },
                        {
                            key: 'SecondaryEmail',
                            type: 'input',
                            templateOptions: {
                                type: 'email',
                                label: 'Secondary Email: '
                            }
                        }
                    ];

                    $scope.submitContact = function (contact) {
                        var data = {};
                        data.csrf_token = csrf_token;
                        data.Id = contact.Id;
                        if(contact.addPrimaryPhone != true){
                            if (contact.PrimaryPhone) {
                                data.PrimaryPhone = null;
                            }
                        }
                        if (contact.PrimaryPhone !== $scope.studentData.PrimaryPhone) {
                            data.PrimaryPhone = contact.PrimaryPhone;
                        }
                        if(contact.addSecondaryPhone != true){
                            if (contact.SecondaryPhone) {
                                data.SecondaryPhone = null;
                            }
                        }
                        if (contact.SecondaryPhone !== $scope.studentData.SecondaryPhone) {
                            data.SecondaryPhone = contact.SecondaryPhone;
                        }
                        if(contact.addWorkPhone != true){
                            if (contact.WorkPhone) {
                                data.WorkPhone = null;
                            }
                        }
                        if (contact.WorkPhone !== $scope.studentData.WorkPhone) {
                            data.WorkPhone = contact.WorkPhone;
                        }
                        if (contact.OfficeBuilding !== $scope.studentData.OfficeBuilding) {
                            data.OfficeBuilding = contact.OfficeBuilding;
                        }
                        if (contact.PrimaryEmail !== $scope.studentData.PrimaryEmail) {
                            data.PrimaryEmail = contact.PrimaryEmail;
                        }
                        if (contact.SecondaryEmail !== $scope.studentData.SecondaryEmail) {
                            data.SecondaryEmail = contact.SecondaryEmail;
                        }
                        api.post('/api/updatestudentinfo', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Contact information update successful.'
                            });
                        }, function (response) {
                            $scope.message = response.data.statusText;
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
         * Modal: Update Personal Information Form
         */
        $scope.updatePersonal = function () {
            
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/updatePersonalForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    }),
                    genderOptions: function () { return helper.getGenderOptions() },
                    ethnicityOptions: function () { return helper.getEthnicityOptions() },
                    countryOptions: api.getAll('/assets/js/other/countries.json').then(function (response) {
                        return response.data;
                    }),
                    citizenStatusOptions: function () { return helper.getCitizenStatusOptions() },
                    visaTypeOptions: function () { return helper.getVisaTypeOptions() }
                },
                controller: function ($uibModalInstance, $scope, csrf_token, genderOptions, ethnicityOptions, countryOptions, citizenStatusOptions, visaTypeOptions) {
                    $scope.personal = {};
                    angular.copy($scope.studentData, $scope.personal);

                    if ($scope.personal.DOB) {
                        $scope.personal.DOB = new Date($scope.personal.DOB);
                    }

                    $scope.personalFields = [
                        {
                            key: 'PreferredGender',
                            type: 'select',
                            templateOptions: {
                                label: 'Preferred Gender: ',
                                options: genderOptions
                            }
                        },
                        {
                            key: 'Ethnicity',
                            type: 'select',
                            templateOptions: {
                                label: 'Ethnicity: ',
                                options: ethnicityOptions
                            }
                        },
                        {
                            key: 'DOB',
                            type: 'datepicker',
                            templateOptions: {
                                label: 'Date of Birth',
                                type: 'text',
                                datepickerPopup: 'M/d/yy',
                                placeholder: '2/11/1839'
                            }
                        },
                        {
                            key: 'CountryOrigin',
                            type: 'select',
                            templateOptions: {
                                label: 'Country of Origin: ',
                                options: countryOptions
                            }
                        },
                        {
                            key: 'CitizenStatus',
                            type: 'select',
                            templateOptions: {
                                label: 'Citizen Status: ',
                                options: citizenStatusOptions
                            }
                        },
                        {
                            key: 'CountryOfCitizenship',
                            type: 'select',
                            templateOptions: {
                                label: 'Country of Citizenship: ',
                                options: countryOptions
                            }
                        },
                        {
                            key: 'VisaType',
                            type: 'select',
                            templateOptions: {
                                label: 'Visa Type (if applicable): ',
                                options: visaTypeOptions
                            }
                        }
                    ];

                    $scope.submitPersonal = function (personal) {
                        var data = {};
                        data.csrf_token = csrf_token;
                        data.Id= personal.Id;

                        if (personal.PreferredGender !== $scope.studentData.PreferredGender) {
                            data.PreferredGender = personal.PreferredGender;
                        }
                        if (personal.Ethnicity !== $scope.studentData.Ethnicity) {
                            data.Ethnicity = personal.Ethnicity;
                        }
                        if (personal.DOB !== $scope.studentData.DOB) {
                            data.DOB = personal.DOB.toDateString();
                        }
                        if (personal.CountryOrigin !== $scope.studentData.CountryOrigin) {
                            data.CountryOrigin = personal.CountryOrigin;
                        }
                        if (personal.CitizenStatus !== $scope.studentData.CitizenStatus) {
                            data.CitizenStatus = personal.CitizenStatus;
                        }
                        if (personal.CountryOfCitizenship !== $scope.studentData.CountryOfCitizenship) {
                            data.CountryOfCitizenship = personal.CountryOfCitizenship;
                        }
                        if (personal.VisaType !== $scope.studentData.VisaType) {
                            data.VisaType = personal.VisaType;
                        }

                        api.post('/api/updatestudentinfo', data).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Personal information update successful.'
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
         * Modal: Add Comment Form
         */
        $scope.addComment = function () {
            $uibModal.open({
                scope: $scope,
                templateUrl: baseUrl + '/assets/partials/addCommentForm.html',
                resolve: {
                    csrf_token: api.getCSRF().then(function (response) {
                        return response.data.value;
                    }),
                    user_cn: api.getUserCN().then(function (response) {
                        return response.data;
                    })
                },
                controller: function ($uibModalInstance, $scope, csrf_token, user_cn) {

                    $scope.commentFields = [
                        {
                            key: 'Comment',
                            type: 'textarea',
                            templateOptions: {
                                label: 'Comment: ',
                                placeholder: 'Enter text here. Comment should be between 2 and 140 characters.',
                                minlength: 2,
                                maxlength: 140,
                                required: true
                            }
                        },
                    ];

                    $scope.submitComment = function (comment) {
                        comment.csrf_token = csrf_token;
                        comment.StudentId = $scope.studentData.Id;
                        var today = new Date();
                        today = today.toDateString();
                        comment.DateSubmitted = today;
                        comment.User = user_cn;
                        api.post('/api/addcomment', comment).then(function (response) {
                            $uibModalInstance.close();
                            loadStudentPage();
                            global.showAlert({
                                type: 'success',
                                msg: 'Comment added.'
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
        Remove Comment
         */
        $scope.removeComment = function (comment) {
            api.getCSRF().then(function (response) {
                var csrf_token = response.data.value;
                var data = {};
                data.csrf_token = csrf_token;
                data.Id = comment.Id;
                api.post('/api/deletecomment', data).then(function (response) {
                    loadStudentPage();
                    global.showAlert({
                        type: 'success',
                        msg: 'Comment removed.'
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