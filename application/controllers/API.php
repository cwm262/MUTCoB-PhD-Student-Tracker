<?php
require __DIR__ .'/../libraries/REST_Controller.php';

/*
 * Restful API for PHD Student Tracker application
 *
 * @author  Cody McCarson
 *
 */
class API extends REST_Controller{

    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    /*
     * Private function log_change()
     *    Called from most post requests
     * $data = array of columns to insert to db
     * Should consist of:
     *      $data[ColumnName],
     *      $data[TableName],
     *      $data[OldValue],
     *      $data[NewValue],
     *      $data[DateModified],
     *      $data[User],
     *      $data[StudentId]
     *
     */
    private function log_change($data){
        $this->db->insert('PhD_StudentTracker_Activity', $data);
    }

    /*
        Public function download_get()
        Downloads files from server
        Responds to requests made to /api/download?id=$id&fileType=$fileType&fileName=$fileName 
        Get parameters:
            $id (Student Table Id or FK StudentId)
            $fileType (String, the file category to determine path)
            $fileName (String, the name of the file, e.g., form.pdf)
        Forces download. Obfuscates file location. 
        Responds with error code 500 if file can not be retrieved. 
    */

    public function download_get(){
        $this->load->helper('download');
        $id = $this->get('id');
        $fileName = $this->get('fileName');
        $fileType = $this->get('fileType');
        try{
            $filePath = null;
            switch ($fileType) {
                case 'admissionOffer':
                    $filePath = "./uploads/admission_offers/$id/$fileName";
                    break;
                case 'DForm':
                    $filePath = "./uploads/required_forms/$id/DForm/$fileName";
                    break;
                case 'CSub':
                    $filePath = "./uploads/required_forms/$id/CSub/$fileName";
                    break;
                case 'CoC':
                    $filePath = "./uploads/required_forms/$id/CoC/$fileName";
                    break;
                case 'Misc':
                    $filePath = "./uploads/required_forms/$id/Misc/$fileName";
                    break;
                case 'academicProbLOP':
                    $filePath = "./uploads/discipline_forms/$id/academicProbLOP/$fileName";
                    break;
                case 'academicProbURG':
                    $filePath = "./uploads/discipline_forms/$id/academicProbURG/$fileName";
                    break;
                case 'recommendation':
                    $filePath = "./uploads/discipline_forms/$id/recommendation/$fileName";
                    break;
                case 'counseling':
                    $filePath = "./uploads/discipline_forms/$id/counseling/$fileName";
                    break;
                default:
                    throw new Exception("Invalid file type specified");
                    break;
            }

            $data = file_get_contents($filePath); // Read the file's contents
            if($data){
                force_download($fileName, $data);
            }else{
                $this->response(NULL, 500);
            }
            

        }
        catch(Exception $e){
            $this->response(array('message' => $e->getMessage()), 500);
        }
    }

    /*
     * CHANGES_GET
     *
     * Responds to get requests made to  /api/changes with all activity associated with specified StudentId
     *
     */
    public function changes_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $this->db->order_by('DateModified DESC');
        $this->response($this->db->get('PhD_StudentTracker_Activity')->result());
    }

    /*
     * CSRF_GET
     *
     * Responds to get requests made to /api/csrf with our CSRF's name and hash
     */
    public function csrf_get(){
        $csrf = array(
            'name' => $this->security->get_csrf_token_name(),
            'value' => $this->security->get_csrf_hash()
        );
        $this->response($csrf);
    }

    /*
     * usercn_get
     *
     * Responds to get requests made to /api/usercn with currently logged-in user's CN
     */
    public function usercn_get(){
        $this->response($this->session->userdata('cn'));
    }

    public function getstudentname_get(){
        $this->db->select('LastName, FirstName, PhDStatus');
        $id = $this->get('id');
        $this->db->where('Id', $id);
        $this->response($this->db->get('PhD_StudentTracker_Student')->result());
    }


    /*
        public function getlike_get

        Responds to GET requests made to /api/getlike?searchParam=[searchParam]

        Currently only searching Student table. Could be expanded easily in future.
    */
    public function getlike_get(){
        $searchParam = $this->get('searchParam');
        $this->db->distinct();
        $this->db->like('StudentNumber', $searchParam);
        $this->db->or_like('LastName', $searchParam);
        $this->db->or_like('FirstName', $searchParam);
        $this->db->or_like('MiddleName', $searchParam);
        $this->db->or_like('PawPrint', $searchParam);
        $this->db->or_like('PrimaryEmail', $searchParam);
        $this->db->or_like('SecondaryEmail', $searchParam);
        $this->db->or_like('PrimaryPhone', $searchParam);
        $this->db->or_like('SecondaryPhone', $searchParam);
        $this->db->or_like('WorkPhone', $searchParam);
        $this->db->or_like('VisaType', $searchParam);
        $this->db->or_like('PreferredGender', $searchParam);
        $this->db->or_like('CitizenStatus', $searchParam);
        $this->db->or_like('DOB', $searchParam);
        $this->db->or_like('Ethnicity', $searchParam);
        $this->db->or_like('CountryOrigin', $searchParam);
        $this->db->or_like('PermanentAddress', $searchParam);
        $this->db->or_like('PermanentCity', $searchParam);
        $this->db->or_like('PermanentState', $searchParam);
        $this->db->or_like('PermanentZipCode', $searchParam);
        $this->db->or_like('LocalAddress', $searchParam);
        $this->db->or_like('LocalCity', $searchParam);
        $this->db->or_like('LocalState', $searchParam);
        $this->db->or_like('LocalZipCode', $searchParam);
        $this->db->or_like('PhDStatus', $searchParam);
        $this->db->or_like('CountryOfCitizenship', $searchParam);
        $this->db->or_like('PermanentCountry', $searchParam);
        $this->db->where('PhDStatus !=', 'Deleted');
        $this->response($this->db->get('PhD_StudentTracker_Student')->result());
    }

    /*
     * STUDENTS_GET
     *
     * Responds to get requests made to /api/students with everything in PhD_StudentTracker_Student table
     * Except where the status of the student is ARCHIVED (i.e., one step before permanent deletion; removed from the view)
     *
     */
    public function students_get(){
        $this->db->select('Id, StudentNumber, PawPrint, LastName, FirstName, PhDStatus');
        $this->db->where('PhDStatus !=', 'Archived');
        $this->db->where('PhDStatus !=', 'Deleted');
        $this->response($this->db->get('PhD_StudentTracker_Student')->result());
    }

    /*
     * ARCHIVEDSTUDENTS_GET
     *
     * Responds to get requests made to /api/students with everything in PhD_StudentTracker_Student table
     *
     * WHERE the PhDStatus = Archived
     *
     */
    public function archivedstudents_get(){
        $this->db->select('Id, StudentNumber, PawPrint, LastName, FirstName, PhDStatus');
        $this->db->where('PhDStatus', 'Archived');
        $this->response($this->db->get('PhD_StudentTracker_Student')->result());
    }

    /*
     * STUDENT_GET
     *
     * Expects a get parameter. Requests should be formatted like /api/student?id=[num]
     *
     * Gets a student via their database Id.
     */
    public function student_get(){
        $id = $this->get('id');
        $this->db->where('Id', $id);
        $get_student = $this->db->get('PhD_StudentTracker_Student');
        $num_rows = $get_student->num_rows();
        if($num_rows === 0){
            $this->response(array('message' => 'No student found with that ID.'), 404);
        }else{
            $this->response($get_student->result());
        }
    }

    /*
     * STUDENT_POST
     *
     * Processes POST requests made to /api/student
     *
     * Responds with the new student object and status code 201 if successful.
     * If unsuccessful, responds with error code 400 or 500 respectively plus an error message.
     */
    public function student_post(){
        $student = array(
            'StudentNumber' => $this->post('StudentNumber'),
            'LastName' => htmlentities($this->post('LastName')),
            'FirstName' => htmlentities($this->post('FirstName')),
            //'Pawprint' => htmlentities($this->post('Pawprint')),
            'Program' => $this->post('Program'),
            'PhDStatus' => "Active"
        );
        if(strlen($this->post('MiddleName')) > 2){
            $student['MiddleName'] = htmlentities($this->post('MiddleName'));
        }
        if(strlen($this->post('Pawprint')) > 1){
            $student['Pawprint'] = htmlentities($this->post('Pawprint'));
        }else{
            $student['Pawprint'] = "N/A";
        }
        if(! ctype_digit($student['StudentNumber'])){
            $this->response(array('message' => 'The Student Number should be numeric.'), 400);
        }
        if( ! $this->db->insert('PhD_StudentTracker_Student', $student)){
            $this->response(array('message' => 'Something went wrong with the submission. Please try again later.'), 500);
        }else{
            $id = $this->db->insert_id();
            foreach($student as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Student';
                $activity['OldValue'] = '"null"';
                $activity['NewValue'] = $value;
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $id;
                $activity['Action'] = 'Added';
                $this->log_change($activity);
            }
            $this->response($id, 201);
        }
    }

    /*
     * DELETESTUDENT_POST
     *
     * Permanently deletes a student. Deletes all files and data associated with student. Not currently implemented.
     */
    //public function deletestudent_post(){
    //    $id = $this->post("Id");

    //    $this->db->where('Id', $id);
    //    $delete_student = $this->db->delete('PhD_StudentTracker_Student');
    //    $delete_student = $this->db->affected_rows();

    //    if($delete_student == 0){
    //        $this->response(array('message' => "Something went wrong. The student has not been deleted. Please contact support."), 500);
    //    }else {
    //        $this->response(array('message' => "The student has been successfully deleted."), 200);
    //    }
    //}

    /*
     * UPDATESTUDENTINFO_POST
     *
     * Updates a student's basic information (e.g., Pawprint, last name, first name)
     *
     * Post request is made to /api/updatestudentinfo
     *
     * API expects one of the POST variables to be "Id". Uses that to find appropriate table row.
     *
     * Parses remaining post array to ensure valid/safe data. Responds with errors if not. If data is OK, updates table row.
     *
     */
    public function updatestudentinfo_post(){
        //Empty student array to be used later for updating table
        $student = array();

        $postArray = $this->post();

        $id = $this->post('Id');

        unset($postArray['Id']);

        //Loop through post input. Check for valid input. If OK, add to student array.
        foreach($postArray as $key => $value){
            if($key === "DOB" || $key === 'VerificationDate' || $key === 'FundingBegins' || $key === 'FundingEnd' || $key === 'ComprehensiveExamPassedDate' || $key === 'ExpectedGraduationDate' || $key === 'GraduationDate'){
                if($value !== "null"){
                    $student[$key] = $value;
                }else{
                    $student[$key] = NULL;
                }
            }else{
                $student[$key] = htmlentities($value);
            }
        }

        if(empty($student)){
            $this->response(NULL, 304);
        }

        $oldValues = $this->db->where('Id', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_Student')->row_array();

        //Specify table row
        $this->db->where('Id', $id);
        $update_student = $this->db->update('PhD_StudentTracker_Student', $student);
        $update_student = $this->db->affected_rows();
        if($update_student == 0){
            $this->response(array('message' => "Sorry. Something has gone wrong with the update. Please try again or contact support."), 400);
        }else{
            foreach($student as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Student';
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['NewValue'] = $value;
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $id;
                $activity['Action'] = 'Updated';
                $this->log_change($activity);
            }
            $this->response($student, 200);
        }
    }

    /*
     * ADMISSIONOFFER_GET
     *
     * Expects a get parameter. Requests should be formatted like /api/admissionoffer?id=[num]
     *
     * Gets a student's admission offer information via their StudentNumber
     */
    public function admissionoffer_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $get_admissionOffer = $this->db->get('PhD_StudentTracker_AdmissionOffer');
        $this->response($get_admissionOffer->result());
    }

    /*
     * COMMENTS_GET
     *
     * Expects a get parameter. /api/comments?id=[num]
     *
     * Gets all notes/comments for a specific student via their StudentNumber
     *
     */
    public function comments_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $get_comments = $this->db->get('PhD_StudentTracker_Comment');
        $this->response($get_comments->result());
    }

    /*
     * EDUCATION_GET
     *
     * Expects a get parameter. /api/education?id=[num]
     *
     * Gets a student's education history via their StudentNumber
     */
    public function education_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $get_education = $this->db->get('PhD_StudentTracker_Education');
        $this->response($get_education->result());
    }

    /*
     * GMAT_GET
     *
     * Make a GET request to /api/gmat?id=[num]
     *
     * [num] = StudentNumber
     *
     */
    public function gmat_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $get_gmat = $this->db->get('PhD_StudentTracker_GMAT');
        $this->response($get_gmat->result());
    }

    /*
     * GRE_GET
     *
     * Make a GET request to /api/gre?id=[num]
     *
     * [num] = StudentNumber
     *
     */
    public function gre_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $get_gre = $this->db->get('PhD_StudentTracker_GRE');
        $this->response($get_gre->result());
    }

    /*
     * IELTS_GET
     *
     * Make a GET request to /api/ielts?id=[num]
     *
     * [num] = StudentNumber
     *
     */
    public function ielts_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $get_ielts = $this->db->get('PhD_StudentTracker_IELTS');
        $this->response($get_ielts->result());
    }

    /*
     * TOEFL_GET
     *
     * Make a GET request to /api/toefl?id=[num]
     *
     * [num] = StudentNumber
     *
     */
    public function toefl_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $get_toefl = $this->db->get('PhD_StudentTracker_TOEFL');
        $this->response($get_toefl->result());
    }

    /*
     * SPEAKTEST_GET
     *
     * Make a GET request to /api/speaktest?id=[num]
     *
     * [num] = StudentNumber
     *
     */
    public function speaktest_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $get_speakTest = $this->db->get('PhD_StudentTracker_SpeakTest');
        $this->response($get_speakTest->result());
    }

    /*
     * REQUIREDFORMS_GET
     *
     * Make a GET request to /api/requiredforms?id=[num]&param=[string]
     *
     * [num] = StudentNumber
     * [string] = FileType
     *
     */
    public function requiredforms_get(){
        $id = $this->get('id');
        $type = $this->get('param');
        $this->db->where('StudentId', $id);
        $this->db->where('FileType', $type);
        $get_requiredForms = $this->db->get('PhD_StudentTracker_Dissertation');
        $this->response($get_requiredForms->result());
    }

    /*
     * COMMITTEECHAIRS_GET
     *
     * Make a GET request to /api/committeechairs?id=[num]
     *
     * [num] = StudentNumber
     *
     */
    public function committeechairs_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $this->db->where('MemberType', 'Chair');
        $get_committeeChairs = $this->db->get('PhD_StudentTracker_Committee');
        $this->response($get_committeeChairs->result());
    }

    /*
     * COMMITTEEMEMBERS_GET
     *
     * Make a GET request to /api/committeemembers?id=[num]
     *
     * [num] = StudentNumber
     *
     */
    public function committeemembers_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $this->db->where('MemberType', 'Department');
        $get_committeeMembers = $this->db->get('PhD_StudentTracker_Committee');
        $this->response($get_committeeMembers->result());
    }

    /*
     * OUTSIDECOMMITTEE_GET
     *
     * Make a GET request to /api/outsidecommittee?id=[num]
     *
     * [num] = StudentNumber
     *
     */
    public function outsidecommittee_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $this->db->where('MemberType', 'Outside');
        $get_outsideCommittee = $this->db->get('PhD_StudentTracker_Committee');
        $this->response($get_outsideCommittee->result());
    }

    /*
     * ACTIVITY_GET
     *
     * Make a GET request to /api/activity?id=[num]
     *
     * [num] = StudentNumber
     *
     */
    public function activity_get(){
        $id = $this->get('id');
        $this->db->where('StudentId', $id);
        $get_activity = $this->db->get('PhD_StudentTracker_ActivityLog');
        $this->response($get_activity->result());
    }

    /*
     * UPDATESTATUS_POST
     *
     * Make a POST request to /api/updatestatus
     *
     * Expects: (POST variables)
     * Student table Id,
     * PhDStatus
     *
     */
    public function updatestatus_post(){
        //Empty student array to be used later for updating table
        $student = array(
            'PhDStatus' => $this->post('PhDStatus')
        );
        $id = $this->post('Id');
        //Locate table row
        $this->db->select('PhDStatus');
        $this->db->where('Id', $this->post('Id'));
        $query = $this->db->get('PhD_StudentTracker_Student');
        $result = $query->row();
        $current_status = $result->PhDStatus;
        if($current_status === $student['PhDStatus']){
            $this->response(NULL, 304);
        }else{
            $update_status = $this->db->where('Id', $this->post('Id'));
            $update_status = $this->db->update('PhD_StudentTracker_Student', $student);
            $update_status = $this->db->affected_rows();
            if($update_status === 0){
                $this->response(array('message' => 'Experienced error while updating student. Please contact support.'), 500);
            }else{
                $activity = array();
                $activity['ColumnName'] = 'Status';
                $activity['TableName'] = 'Student';
                $activity['OldValue'] = $current_status;
                $activity['NewValue'] = $student['PhDStatus'];
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $id;
                $activity['Action'] = 'Updated';
                $this->log_change($activity);
                $this->response($student, 200);
            }
        }
    }

    /*
     * UPLOADADMISSIONOFFER_POST
     *
     * Make a POST request to /api/uploadadmissionoffer
     *
     * Expects: (POST variables)
     * StudentId (Student's Id),
     * OfferDate (optional),
     * ApplicationDate (optional),
     * CampusVisitDate (optional),
     * ReasonForDecline (optional)
     *
     * AND
     *
     * $_FILES['file']
     *
     */
    public function uploadadmissionoffer_post(){
        $studentNumber = $this->post("StudentId");
        $admissionOffer = array();
        foreach($this->post() as $key => $value){
            if($key === "OfferDate" || $key === "ApplicationDate" || $key === "CampusVisitDate" || $key === 'StudentId'){
                $admissionOffer[$key] = $value;
            }
            if($key === "ReasonForDecline"){
                $admissionOffer[$key] = htmlentities($value);
            }
        }
        if(isset($_FILES['file'])){
            $upload_path = "./uploads/admission_offers/$studentNumber/";
            if(!is_dir($upload_path)){
                mkdir($upload_path, 0777);
            }
            $config['upload_path'] = $upload_path;
            $config['allowed_types'] = 'pdf|docx|doc';
            $config['max_size'] = 20480;
            $config['remove_spaces'] = FALSE;
            $this->load->library('upload', $config);
            if(! $this->upload->do_upload('file')){
                $message = $this->upload->display_errors('', '');
                $this->response(array('message' => $message), 400);
            }else{
                $newFileName = $this->upload->data('file_name');
                $admissionOffer["Attachment"] = $newFileName;//$_FILES['file']['name'];
                $insert_offer = $this->db->insert('PhD_StudentTracker_AdmissionOffer', $admissionOffer);
                if(! $insert_offer){
                    $this->response(array('message' => 'Something went wrong with the submission. The file may already be in the database.'), 400);
                }else{
                    $studentId = $admissionOffer['StudentId'];
                    unset($admissionOffer['StudentId']);
                    foreach($admissionOffer as $key => $value){
                        $activity = array();
                        $columnName = preg_split('/(?=[A-Z])/',$key);
                        $columnName = implode(" ", $columnName);
                        $activity['ColumnName'] = $columnName;
                        $activity['TableName'] = 'Admission Offer';
                        $activity['OldValue'] = '"null"';
                        $activity['NewValue'] = $value;
                        $activity['DateModified'] = date('Y-m-d H:i:s');
                        $activity['User'] = $this->session->userdata('cn');
                        $activity['Action'] = 'Added';
                        $activity['StudentId'] = $studentId;
                        $this->log_change($activity);
                    }
                    $this->response($admissionOffer, 201);
                }
            }
        }else{
            $insert_offer = $this->db->insert('PhD_StudentTracker_AdmissionOffer', $admissionOffer);
            if(! $insert_offer){
                $this->response(array('message' => 'Something went wrong with the submission. Please contact support.'), 400);
            }else{
                $studentId = $admissionOffer['StudentId'];
                unset($admissionOffer['StudentId']);
                foreach($admissionOffer as $key => $value){
                    $activity = array();
                    $columnName = preg_split('/(?=[A-Z])/',$key);
                    $columnName = implode(" ", $columnName);
                    $activity['ColumnName'] = $columnName;
                    $activity['TableName'] = 'Admission Offer';
                    $activity['OldValue'] = '"null"';
                    $activity['NewValue'] = $value;
                    $activity['DateModified'] = date('Y-m-d H:i:s');
                    $activity['User'] = $this->session->userdata('cn');
                    $activity['Action'] = 'Added';
                    $activity['StudentId'] = $studentId;
                    $this->log_change($activity);
                }
                $this->response($admissionOffer, 201);
            }
        }

    }

    /*
     * UPDATEADMISSIONOFFER_POST
     *
     * Make a POST request to /api/updateadmissionoffer
     *
     * Updates table where data has been given.
     *
     * Updates file on record if a new file is specified. (Or if file is asked to be removed.)
     *
     * Expects: (POST variables)
     * Id,
     * StudentId
     * OfferDate (optional),
     * ApplicationDate (optional),
     * CampusVisitDate (optional),
     * ReasonForDecline (optional)
     *
     * AND
     *
     * $_FILES['file'] (optional)
     *
     */

    public function updateadmissionoffer_post(){
        $id = $this->post("Id");
        $studentNumber = $this->post("StudentId");
        $postArray = $this->post();
        $admissionOffer = array();
        foreach($postArray as $key => $value){
            if($key === "ApplicationDate" || $key === "CampusVisitDate" || $key === "OfferDate"){
                if($value !== "null"){
                    $admissionOffer[$key] = $value;
                }else{
                    $admissionOffer[$key] = NULL;
                }
            }
            if($key === "ReasonForDecline"){
                $admissionOffer[$key] = htmlentities($value);
            }
        }

        if(isset($_FILES['file'])){
            if(isset($_POST['Attachment']) && $_POST['Attachment'] !== "null"){
                $filename = $this->post('Attachment');
                $filePathForUnlink = "./uploads/admission_offers/$studentNumber/$filename";
                try{
                    $result = unlink($filePathForUnlink);
                    if($result === false){
                        throw new Exception("Could not delete the file specified. Please contact support.");
                    }
                }
                catch(Exception $e){
                    $this->response(array('message' => $e->getMessage()), 500);
                }
            }

            $upload_path = "./uploads/admission_offers/$studentNumber/";
            $config['upload_path'] = $upload_path;
            $config['allowed_types'] = 'pdf|docx|doc';
            $config['max_size'] = 20480;
            $config['remove_spaces'] = FALSE;
            $this->load->library('upload', $config);

            if(! $this->upload->do_upload('file')){
                $message = $this->upload->display_errors('', '');
                $this->response(array('message' => $message), 400);
            }

            $newFileName = $this->upload->data('file_name');
            $admissionOffer["Attachment"] = $newFileName;//$_FILES['file']['name'];
        }

        if($this->post('deleteFileOnRecord')){
            $filename = $this->post('Attachment');
            $admissionOffer['Attachment'] = null;
            $filePathForUnlink = "./uploads/admission_offers/$studentNumber/$filename";
            try{
                $result = unlink($filePathForUnlink);
                if($result === false){
                    throw new Exception("Could not delete the file specified. Please contact support.");
                }
            }
            catch(Exception $e){
                $this->response(array('message' => $e->getMessage()), 500);
            }
        }

        $oldValues = $this->db->where('Id', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_AdmissionOffer')->row_array();

        //Locate table row
        $this->db->where('Id', $id);
        $update_admissionOffer = $this->db->update('PhD_StudentTracker_AdmissionOffer', $admissionOffer);
        $update_admissionOffer = $this->db->affected_rows();
        if($update_admissionOffer == 0){
            $this->response(array('message' => "Uh oh. Something went wrong. Please try again later or contact support."), 500);
        }else {
            foreach($admissionOffer as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Admission Offer';
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['NewValue'] = $value;
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $oldValues['StudentId'];
                $activity['Action'] = 'Updated';
                $this->log_change($activity);
            }
            $this->response($admissionOffer, 200);
        }
    }

    /*
     * DELETEADMISSIONOFFER_POST
     *
     * Permanently deletes an admission offer.
     *
     * Request is a POST request made to /api/deleteadmissionoffer
     *
     * Expects an Id for the offer in question. Looks for an Attachment if one was sent over as a post variable.
     * Deletes that if it can. Removes row from db table, too.
     */
    public function deleteadmissionoffer_post(){
        $id = $this->post("Id");
        $studentNumber = $this->post("StudentId");


        if(isset($_POST['Attachment']) && !empty($_POST['Attachment'])){
            $fileName = $this->post('Attachment');
            $filePathForUnlink = "./uploads/admission_offers/$studentNumber/$fileName";
            unlink($filePathForUnlink);

            // if(!unlink($filePathForUnlink)){
            //     $fileName = str_replace(' ', '_', $fileName);
            //     $filePathForUnlink = "./uploads/admission_offers/$studentNumber/$fileName";
            //     if(!unlink($filePathForUnlink)){
            //         $this->response(array('message' => "Could not delete specified file. Contact support."), 500);
            //     }
            // }
        }

        $oldValues = $this->db->where('Id', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_AdmissionOffer')->row_array();

        $this->db->where('Id', $id);
        $delete_offer = $this->db->delete('PhD_StudentTracker_AdmissionOffer');
        $delete_offer = $this->db->affected_rows();

        if($delete_offer == 0){
            $this->response(array('message' => "Something went wrong. The offer has not been deleted. Please contact support."), 500);
        }else {
            $studentId = $oldValues['StudentId'];
            unset($oldValues['StudentId']);
            unset($oldValues['Id']);
            foreach($oldValues as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Admission Offer';
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $studentId;
                $activity['Action'] = 'Removed';
                $this->log_change($activity);
            }
            $this->response(array('message' => "The offer has been successfully deleted."), 200);
        }
    }


    /*
     * UPLOADREQUIREDFORM_POST
     *
     * Make a POST request to /api/uploadrequiredform
     *
     * Expects: (POST variables)
     * StudentId (Student's Id),
     * SubmitDate (optional)
     * FileType (String, type of file to be uploaded)
     *
     * AND
     *
     * $_FILES['file']
     *
     */
    public function uploadrequiredform_post(){
        $studentNumber = $this->post("StudentId");
        $fileType = $this->post('FileType');
        $postArray = $this->post();
        $requiredForm = array();
        foreach($postArray as $key => $value){
            if($key === "SubmitDate"){
                if($value !== "null"){
                    $requiredForm[$key] = $value;
                }else{
                    $requiredForm[$key] = NULL;
                }
            }else{
                $requiredForm[$key] = $value;
            }
        }

        if(isset($_FILES['file'])){
            $checkToSeeIfParentDirExists = "./uploads/required_forms/$studentNumber";
            if(!is_dir($checkToSeeIfParentDirExists)){
                mkdir($checkToSeeIfParentDirExists, 0777);
            }
            $upload_path = "./uploads/required_forms/$studentNumber/$fileType/";
            if(!is_dir($upload_path)){
                mkdir($upload_path, 0777);
            }
            $config['upload_path'] = $upload_path;
            $config['allowed_types'] = 'pdf|docx|doc';
            $config['max_size'] = 20480;
            $config['remove_spaces'] = FALSE;
            $this->load->library('upload', $config);
            if(! $this->upload->do_upload('file')){
                $message = $this->upload->display_errors('', '');
                $this->response(array('message' => $message), 400);
            }else{
                $newFileName = $this->upload->data('file_name');
                $requiredForm["PDFName"] = $newFileName; //$_FILES['file']['name'];
                $insert_form = $this->db->insert('PhD_StudentTracker_Dissertation', $requiredForm);
                if(! $insert_form){
                    $this->response(array('message' => 'Something went wrong with the submission. The file may already be in the database.'), 400);
                }else{
                    unset($requiredForm['StudentId']);
                    foreach($requiredForm as $key => $value){
                        $activity = array();
                        $columnName = preg_split('/(?=[A-Z])/',$key);
                        $columnName = implode(" ", $columnName);
                        $activity['ColumnName'] = $columnName;
                        $activity['TableName'] = 'Required Form';
                        $activity['OldValue'] = '"null"';
                        $activity['NewValue'] = $value;
                        $activity['DateModified'] = date('Y-m-d H:i:s');
                        $activity['User'] = $this->session->userdata('cn');
                        $activity['Action'] = 'Added';
                        $activity['StudentId'] = $studentNumber;
                        $this->log_change($activity);
                    }
                    $this->response($requiredForm, 201);
                }
            }
        }else{
            $insert_form = $this->db->insert('PhD_StudentTracker_Dissertation', $requiredForm);
            if(! $insert_form){
                $this->response(array('message' => 'Something went wrong with the submission. Please contact support.'), 400);
            }else{
                unset($requiredForm['StudentId']);
                foreach($requiredForm as $key => $value){
                    $activity = array();
                    $columnName = preg_split('/(?=[A-Z])/',$key);
                    $columnName = implode(" ", $columnName);
                    $activity['ColumnName'] = $columnName;
                    $activity['TableName'] = 'Required Form';
                    $activity['OldValue'] = '"null"';
                    $activity['NewValue'] = $value;
                    $activity['DateModified'] = date('Y-m-d H:i:s');
                    $activity['User'] = $this->session->userdata('cn');
                    $activity['Action'] = 'Added';
                    $activity['StudentId'] = $studentNumber;
                    $this->log_change($activity);
                }
                $this->response($requiredForm, 201);
            }
        }
    }

    /*
     * UPDATEREQUIREDFORM_POST
     *
     * Make a POST request to /api/updaterequiredform
     *
     * Updates table where data has been given.
     *
     * Updates file on record if a new file is specified. (Or if file is asked to be removed.)
     *
     * Expects: (POST variables)
     * ID,
     * StudentId,
     * SubmitDate (optional),
     * PDFName (optional),
     * DissertationNumber (optional)
     *
     * AND
     *
     * $_FILES['file'] (optional)
     *
     */

    public function updaterequiredform_post(){
        $id = $this->post("ID");
        $studentNumber = $this->post("StudentId");
        $fileType = $this->post('FileType');
        $postArray = $this->post();
        $reqForm = array();
        foreach($postArray as $key => $value){
            if($key === "SubmitDate"){
                if($value !== "null"){
                    $reqForm[$key] = $value;
                }else{
                    $reqForm[$key] = NULL;
                }
            }
            if($key === "DFormType" || $key === 'DissertationApproved'){
                $reqForm[$key] = $value;
            }
        }

        if(isset($_FILES['file'])){
            if(isset($_POST['PDFName']) && $_POST['PDFName'] !== "null"){
                $filename = $this->post('PDFName');
                $filePathForUnlink = "./uploads/required_forms/$studentNumber/$fileType/$filename";
                try{
                    $result = unlink($filePathForUnlink);
                    if($result === false){
                        throw new Exception("Could not delete the file specified. Please contact support.");
                    }
                }
                catch(Exception $e){
                    $this->response(array('message' => $e->getMessage()), 500);
                }
            }

            $upload_path = "./uploads/required_forms/$studentNumber/$fileType/";
            $config['upload_path'] = $upload_path;
            $config['allowed_types'] = 'pdf|docx|doc';
            $config['max_size'] = 20480;
            $config['remove_spaces'] = FALSE;
            $this->load->library('upload', $config);

            if(! $this->upload->do_upload('file')){
                $message = $this->upload->display_errors('', '');
                $this->response(array('message' => $message), 400);
            }

            $newFileName = $this->upload->data('file_name');
            $reqForm["PDFName"] = $newFileName; //$_FILES['file']['name'];
        }

        $oldValues = $this->db->where('ID', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_Dissertation')->row_array();

        //Locate table row
        $this->db->where('ID', $id);
        $update_form = $this->db->update('PhD_StudentTracker_Dissertation', $reqForm);
        $update_form = $this->db->affected_rows();
        if($update_form == 0){
            $this->response(array('message' => "Uh oh. Something went wrong. Please try again later or contact support."), 500);
        }else {
            foreach($reqForm as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Required Form';
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['NewValue'] = $value;
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $oldValues['StudentId'];
                $activity['Action'] = 'Updated';
                $this->log_change($activity);
            }
            $this->response($reqForm, 200);
        }
    }


    /*
     * DELETEREQUIREDFORM_POST
     *
     * Permanently deletes a required form
     *
     * Request is a POST request made to /api/deleterequiredform
     *
     * Expects an Id for the offer in question. Looks for an Attachment if one was sent over as a post variable.
     * Deletes that if it can. Removes row from db table, too.
     */
    public function deleterequiredform_post(){
        $id = $this->post("ID");
        $studentNumber = $this->post("StudentId");
        $fileType = $this->post("FileType");

        $fileName = $this->post('PDFName');
        $filePathForUnlink = "./uploads/required_forms/$studentNumber/$fileType/$fileName";
        unlink($filePathForUnlink);

        $oldValues = $this->db->where('ID', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_Dissertation')->row_array();

        $this->db->where('ID', $id);
        $delete_form = $this->db->delete('PhD_StudentTracker_Dissertation');
        $delete_form = $this->db->affected_rows();

        if($delete_form === 0){
            $this->response(array('message' => "Something went wrong. The form has not been deleted. Please contact support."), 500);
        }else {
            $studentId = $oldValues['StudentId'];
            unset($oldValues['StudentId']);
            unset($oldValues['ID']);
            foreach($oldValues as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Required Form';
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $studentId;
                $activity['Action'] = 'Removed';
                $this->log_change($activity);
            }
            $this->response(array('message' => "The form has been successfully deleted."), 200);
        }
    }

    /*
        ADDCOMMENT_POST

        Adds a comment to db.

        Request is made to /api/addcomment (POST)

        Expects:
        StudentId (foreign key, relates to Student table, Id column),
        Comment (text area),
        User (the logged in user),
        and a DateSubmitted
    */
    public function addcomment_post(){
        $comment = array(
            'StudentId' => $this->post('StudentId'),
            'Comment' => htmlentities($this->post('Comment')),
            'User' => $this->post('User'),
            'DateSubmitted' => $this->post('DateSubmitted')
        );
        if( ! $this->db->insert('PhD_StudentTracker_Comment', $comment)){
            $this->response(array('message' => 'Something went wrong with the submission. Please contact support.'), 500);
        }else{
            $this->response($comment, 201);
        }
    }

    /*
        DELETECOMMENT_POST

        Deletes a comment.

        Request is made to /api/deletecomment (POST)

        Expects:
        Id that uniquely identifies the row in table.

    */
    public function deletecomment_post(){
        $id = $this->post('Id');
        $this->db->where('Id', $id);
        $delete_comment = $this->db->delete('PhD_StudentTracker_Comment');
        $delete_comment = $this->db->affected_rows();

        if($delete_comment === 0){
            $this->response(array('message' => 'Something went wrong. The comment has not been deleted. Please contact support.'), 500);
        }else{
            $this->response(array('message' => 'The comment has been successfully deleted.'), 200);
        }
    }


    /*
        ADDEDUCATION_POST

        Adds education entry to Education table in db.

        Request is made to /api/addeducation (POST)

        Expects:
        StudentId (foreign key, connected to Student Table's Id column),
        Optional:
        StartDate, EndDate, DegreeTitle, DegreeDate, GPA, Institution, Location, Degree

    */
    public function addeducation_post(){
        $postArray = $this->post();
        $educationEntry = array();
        foreach($postArray as $key => $value){
            if($key === "StudentId" || $key === "StartDate" || $key === "EndDate" || $key === "DegreeTitle" || $key === "DegreeDate" || $key === "GPA"){
                $educationEntry[$key] = $value;
            }
            if($key === "Institution" || $key === "Location" || $key === "Degree"){
                $educationEntry[$key] = htmlentities($value);
            }
        }
        if( ! $this->db->insert('PhD_StudentTracker_Education', $educationEntry)){
            $this->response(array('message' => 'Something went wrong with the submission. Please contact support.'), 500);
        }else{
            $studentId = $educationEntry['StudentId'];
            unset($educationEntry['StudentId']);
            foreach($educationEntry as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Education';
                $activity['OldValue'] = '"null"';
                $activity['NewValue'] = $value;
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $studentId;
                $activity['Action'] = 'Added';
                $this->log_change($activity);
            }
            $this->response($educationEntry, 201);
        }

    }


    /*
        EDUCATIONUPDATE_POST

        Updates education entry in Education table in db.

        Request is made to /api/educationupdate (POST)

        Expects:
        StudentId (foreign key, connected to Student Table's Id column),
        Optional:
        StartDate, EndDate, DegreeTitle, DegreeDate, GPA, Institution, Location, Degree

    */
    public function educationupdate_post(){
        $postArray = $this->post();
        $educationEntry = array();
        $id = $this->post('Id');
        foreach($postArray as $key => $value){
            if($key === "StartDate" || $key === "EndDate" || $key === "DegreeTitle" || $key === "DegreeDate" || $key === 'GPA'){
                $educationEntry[$key] = $value;
            }
            if($key === "Institution" || $key === "Location" || $key === "Degree"){
                $educationEntry[$key] = htmlentities($value);
            }
        }

        $oldValues = $this->db->where('Id', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_Education')->row_array();

        $is_updated = $this->db->where('Id', $id);
        $is_updated = $this->db->update('PhD_StudentTracker_Education', $educationEntry);
        $is_updated = $this->db->affected_rows();
        if($is_updated === 0){
            $this->response(array('message' => 'Something went wrong with the submission. Please contact support.'), 500);
        }else{
            foreach($educationEntry as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Education';
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['NewValue'] = $value;
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $oldValues['StudentId'];
                $activity['Action'] = 'Updated';
                $this->log_change($activity);
            }
            $this->response($educationEntry, 201);
        }

    }


    /*
    EDUCATIONDELETE_POST

    POST request is made to /api/educationdelete

    Required: Id that uniquely identifies table row
    */
    public function educationdelete_post(){
        $id = $this->post('Id');

        $oldValues = $this->db->where('Id', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_Education')->row_array();

        $remove = $this->db->where('Id', $id);
        $remove = $this->db->delete('PhD_StudentTracker_Education');
        $remove = $this->db->affected_rows();

        if($remove === 0){
            $this->response(array('message' => 'Something went wrong with the deletion. Please contact support.'), 500);
        }else{
            $studentId = $oldValues['StudentId'];
            unset($oldValues['StudentId']);
            unset($oldValues['Id']);
            foreach($oldValues as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Education';
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $studentId;
                $activity['Action'] = 'Removed';
                $this->log_change($activity);
            }
            $this->response(array('message' => 'The entry has been successfully deleted.'), 200);
        }
    }



    // addtestscore_post
    // Expects: POST request w/
    //     Date, TotalScore, TotalPercent, Verbal, Quantitative, Written, StudentID
    //     All/most are optional.

    public function addtestscore_post(){
        $testType = $this->post('testType');
        $postArray = $this->post();
        $testScore = array();
        foreach($postArray as $key => $value){
            if($key === 'Date' || $key === 'TotalScore' || $key === 'TotalPercent' || $key === 'Verbal' || $key === 'Quantitative' || $key === 'Written' || $key === 'StudentId'){
                $testScore[$key] = $value;
            }
        }

        if( ! $this->db->insert('PhD_StudentTracker_'.$testType, $testScore)){
            $this->response(array('message' => 'Something went wrong with the submission. Please contact support.'), 500);
        }else{
            $studentId = $testScore['StudentId'];
            unset($testScore['StudentId']);
            foreach($testScore as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = $testType;
                $activity['OldValue'] = '"null"';
                $activity['NewValue'] = $value;
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['Action'] = 'Added';
                $activity['StudentId'] = $studentId;
                $this->log_change($activity);
            }
            $this->response($testScore, 201);
        }

    }

    public function updatetestscore_post(){
        $postArray = $this->post();
        $testType = $this->post('testType');
        $test_update = array();
        $id = $this->post('Id');
        foreach($postArray as $key => $value){
            if($key === 'Date' || $key === 'TotalScore' || $key === 'TotalPercent' || $key === 'Verbal' || $key === 'Quantitative' || $key === 'Written'){
                $test_update[$key] = $value;
            }
        }

        $oldValues = $this->db->where('Id', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_'.$testType)->row_array();

        $is_updated = $this->db->where('Id', $id);
        $is_updated = $this->db->update('PhD_StudentTracker_'.$testType, $test_update);
        $is_updated = $this->db->affected_rows();
        if($is_updated === 0){
            $this->response(array('message' => 'Something went wrong with the submission. Please contact support.'), 500);
        }else{
            foreach($test_update as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = $testType;
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['NewValue'] = $value;
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $oldValues['StudentId'];
                $activity['Action'] = 'Updated';
                $this->log_change($activity);
            }
            $this->response($test_update, 201);
        }
    }

    public function testscoredelete_post(){
        $id = $this->post('Id');
        $test_type = $this->post('testType');

        $oldValues = $this->db->where('Id', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_'.$test_type)->row_array();

        $remove = $this->db->where('Id', $id);
        $remove = $this->db->delete('PhD_StudentTracker_'.$test_type);
        $remove = $this->db->affected_rows();

        if($remove === 0){
            $this->response(array('message' => 'Something went wrong with the deletion. Please contact support.'), 500);
        }else{
            $studentId = $oldValues['StudentId'];
            unset($oldValues['StudentId']);
            unset($oldValues['Id']);
            foreach($oldValues as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = $test_type;
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $studentId;
                $activity['Action'] = 'Removed';
                $this->log_change($activity);
            }
            $this->response(array('message' => 'The entry has been successfully deleted.'), 200);
        }
    }

    public function addcommittee_post(){
        $postArray = $this->post();
        $committee = array();
        foreach($postArray as $key => $value){
            if($key === "DefendedDate" || $key === "MemberType" || $key === "StudentId"){
                $committee[$key] = $value;
            }
            if($key === "DissertationTitle" || $key === "MemberName" || $key === "MemberDepartment"){
                $committee[$key] = htmlentities($value);
            }
        }

        if( ! $this->db->insert('PhD_StudentTracker_Committee', $committee)){
            $this->response(array('message' => 'Something went wrong with the submission. Please contact support.'), 500);
        }else{
            $studentId = $committee['StudentId'];
            unset($committee['StudentId']);
            foreach($committee as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Committee';
                $activity['OldValue'] = '"null"';
                $activity['NewValue'] = $value;
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['Action'] = 'Added';
                $activity['StudentId'] = $studentId;
                $this->log_change($activity);
            }
            $this->response($committee, 201);
        }
    }

    public function updatecommittee_post(){
        $postArray = $this->post();
        $committee = array();
        $studentId = $this->post('StudentId');
        $id = $this->post('Id');
        foreach($postArray as $key => $value){
            if($key === "DefendedDate"){
                $committee[$key] = $value;
            }
            if($key === "DissertationTitle" || $key === "MemberName" || $key === "MemberDepartment"){
                $committee[$key] = htmlentities($value);
            }
        }

        $oldValues = $this->db->where('Id', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_Committee')->row_array();

        $is_updated = $this->db->where('Id', $id);
        $is_updated = $this->db->update('PhD_StudentTracker_Committee', $committee);
        $is_updated = $this->db->affected_rows();
        if($is_updated === 0){
            $this->response(array('message' => 'Something went wrong with the submission. Please contact support.'), 500);
        }else{
            foreach($committee as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Committee';
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['NewValue'] = $value;
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $studentId;
                $activity['Action'] = 'Updated';
                $this->log_change($activity);
            }
            $this->response($committee, 201);
        }
    }

    public function removecommittee_post(){
        $id = $this->post('Id');

        $oldValues = $this->db->where('Id', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_Committee')->row_array();

        $remove = $this->db->where('Id', $id);
        $remove = $this->db->delete('PhD_StudentTracker_Committee');
        $remove = $this->db->affected_rows();

        if($remove === 0){
            $this->response(array('message' => 'Something went wrong with the deletion. Please contact support.'), 500);
        }else{
            $studentId = $oldValues['StudentId'];
            unset($oldValues['StudentId']);
            unset($oldValues['Id']);
            foreach($oldValues as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Committee';
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $studentId;
                $activity['Action'] = 'Removed';
                $this->log_change($activity);
            }
            $this->response(array('message' => 'The entry has been successfully deleted.'), 200);
        }
    }

    /*
     * DISCFORMS_GET
     *
     * Make a GET request to /api/discforms?id=[num]&param=[string]
     *
     * [num] = Student Id
     * [string] = FileType
     *
     */
    public function discforms_get(){
        $id = $this->get('id');
        $type = $this->get('param');
        $this->db->where('StudentId', $id);
        $this->db->where('FileType', $type);
        $get_requiredForms = $this->db->get('PhD_StudentTracker_Discipline');
        $this->response($get_requiredForms->result());
    }


    /*
     * UPLOADDISCFORM_POST
     *
     * Make a POST request to /api/uploaddiscform
     *
     * Expects: (POST variables)
     * StudentId (Student's Id),
     * SubmitDate (optional)
     *
     * AND
     *
     * $_FILES['file']
     *
     */
    public function uploaddiscform_post(){
        $studentNumber = $this->post("StudentId");
        $fileType = $this->post('FileType');
        $postArray = $this->post();
        $discForm = array();
        foreach($postArray as $key => $value){
            if($key === "SubmitDate"){
                if($value !== "null"){
                    $discForm[$key] = $value;
                }else{
                    $discForm[$key] = NULL;
                }
            }else{
                $discForm[$key] = $value;
            }
        }

        if(isset($_FILES['file'])){
            $checkToSeeIfParentDirExists = "./uploads/discipline_forms/$studentNumber";
            if(!is_dir($checkToSeeIfParentDirExists)){
                mkdir($checkToSeeIfParentDirExists, 0777);
            }
            $upload_path = "./uploads/discipline_forms/$studentNumber/$fileType/";
            if(!is_dir($upload_path)){
                mkdir($upload_path, 0777);
            }
            $config['upload_path'] = $upload_path;
            $config['allowed_types'] = 'pdf|docx|doc';
            $config['max_size'] = 20480;
            $config['remove_spaces'] = FALSE;
            $this->load->library('upload', $config);
            if(! $this->upload->do_upload('file')){
                $message = $this->upload->display_errors('', '');
                $this->response(array('message' => $message), 400);
            }else{
                $newFileName = $this->upload->data('file_name');
                $discForm["PDFName"] = $newFileName; //$_FILES['file']['name'];
                $insert_form = $this->db->insert('PhD_StudentTracker_Discipline', $discForm);
                if(! $insert_form){
                    $this->response(array('message' => 'Something went wrong with the submission. The file may already be in the database.'), 400);
                }else{
                    unset($discForm['StudentId']);
                    foreach($discForm as $key => $value){
                        $activity = array();
                        $columnName = preg_split('/(?=[A-Z])/',$key);
                        $columnName = implode(" ", $columnName);
                        $activity['ColumnName'] = $columnName;
                        $activity['TableName'] = 'Discipline Form';
                        $activity['OldValue'] = '"null"';
                        $activity['NewValue'] = $value;
                        $activity['DateModified'] = date('Y-m-d H:i:s');
                        $activity['User'] = $this->session->userdata('cn');
                        $activity['Action'] = 'Added';
                        $activity['StudentId'] = $studentNumber;
                        $this->log_change($activity);
                    }
                    $this->response($discForm, 201);
                }
            }
        }else{
            $insert_form = $this->db->insert('PhD_StudentTracker_Discipline', $discForm);
            if(! $insert_form){
                $this->response(array('message' => 'Something went wrong with the submission. Please contact support.'), 400);
            }else{
                unset($discForm['StudentId']);
                    foreach($discForm as $key => $value){
                        $activity = array();
                        $columnName = preg_split('/(?=[A-Z])/',$key);
                        $columnName = implode(" ", $columnName);
                        $activity['ColumnName'] = $columnName;
                        $activity['TableName'] = 'Discipline Form';
                        $activity['OldValue'] = '"null"';
                        $activity['NewValue'] = $value;
                        $activity['DateModified'] = date('Y-m-d H:i:s');
                        $activity['User'] = $this->session->userdata('cn');
                        $activity['Action'] = 'Added';
                        $activity['StudentId'] = $studentNumber;
                        $this->log_change($activity);
                    }
                $this->response($discForm, 201);
            }
        }
    }

    /*
     * UPDATEDISCFORM_POST
     *
     * Make a POST request to /api/updatediscform
     *
     * Updates table where data has been given.
     *
     * Updates file on record if a new file is specified. (Or if file is asked to be removed.)
     *
     * Expects: (POST variables)
     * Id,
     * StudentId,
     * SubmitDate (optional),
     * PDFName (optional),
     *
     * AND
     *
     * $_FILES['file'] (optional)
     *
     */

    public function updatediscform_post(){
        $id = $this->post("Id");
        $studentNumber = $this->post("StudentId");
        $fileType = $this->post('FileType');
        $postArray = $this->post();
        $discForm = array();
        foreach($postArray as $key => $value){
            if($key === "SubmitDate"){
                if($value !== "null"){
                    $discForm[$key] = $value;
                }else{
                    $discForm[$key] = NULL;
                }
            }
            if($key === "Semester"){
                $discForm[$key] = $value;
            }
        }

        if(isset($_FILES['file'])){
            if(isset($_POST['PDFName']) && $_POST['PDFName'] !== "null"){
                $filename = $this->post('PDFName');
                $filePathForUnlink = "./uploads/discipline_forms/$studentNumber/$fileType/$filename";
                try{
                    $result = unlink($filePathForUnlink);
                    if($result === false){
                        throw new Exception("Could not delete the file specified. Please contact support.");
                    }
                }
                catch(Exception $e){
                    $this->response(array('message' => $e->getMessage()), 500);
                }
            }

            $upload_path = "./uploads/discipline_forms/$studentNumber/$fileType/";
            $config['upload_path'] = $upload_path;
            $config['allowed_types'] = 'pdf|docx|doc';
            $config['max_size'] = 20480;
            $config['remove_spaces'] = FALSE;
            $this->load->library('upload', $config);

            if(! $this->upload->do_upload('file')){
                $message = $this->upload->display_errors('', '');
                $this->response(array('message' => $message), 400);
            }

            $newFileName = $this->upload->data('file_name');
            $discForm["PDFName"] = $newFileName; //$_FILES['file']['name'];
        }

        $oldValues = $this->db->where('Id', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_Discipline')->row_array();

        //Locate table row
        $update_form = $this->db->where('Id', $id);
        $update_form = $this->db->update('PhD_StudentTracker_Discipline', $discForm);
        $update_form = $this->db->affected_rows();
        if($update_form == 0){
            $this->response(array('message' => "Uh oh. Something went wrong. Please try again later or contact support."), 500);
        }else {
            foreach($discForm as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Discipline Form';
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['NewValue'] = $value;
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $oldValues['StudentId'];
                $activity['Action'] = 'Updated';
                $this->log_change($activity);
            }
            $this->response($discForm, 200);
        }
    }

    public function deletediscform_post(){
        $id = $this->post("Id");
        $studentNumber = $this->post("StudentId");
        $fileType = $this->post("FileType");

        $fileName = $this->post('PDFName');
        $filePathForUnlink = "./uploads/discipline_forms/$studentNumber/$fileType/$fileName";
        unlink($filePathForUnlink);

        $oldValues = $this->db->where('Id', $id);
        $oldValues = $this->db->get('PhD_StudentTracker_Discipline')->row_array();

        $this->db->where('Id', $id);
        $delete_form = $this->db->delete('PhD_StudentTracker_Discipline');
        $delete_form = $this->db->affected_rows();

        if($delete_form === 0){
            $this->response(array('message' => "Something went wrong. The form has not been deleted. Please contact support."), 500);
        }else {
            $studentId = $oldValues['StudentId'];
            unset($oldValues['StudentId']);
            unset($oldValues['Id']);
            foreach($oldValues as $key => $value){
                $activity = array();
                $columnName = preg_split('/(?=[A-Z])/',$key);
                $columnName = implode(" ", $columnName);
                $activity['ColumnName'] = $columnName;
                $activity['TableName'] = 'Discipline Form';
                $activity['OldValue'] = (empty($oldValues[$key])) ? '"null"' : $oldValues[$key];
                $activity['DateModified'] = date('Y-m-d H:i:s');
                $activity['User'] = $this->session->userdata('cn');
                $activity['StudentId'] = $studentId;
                $activity['Action'] = 'Removed';
                $this->log_change($activity);
            }
            $this->response(array('message' => "The form has been successfully deleted."), 200);
        }
    }

}