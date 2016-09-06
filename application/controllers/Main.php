<?php

    /*
     * Main Controller handles the index page
     *
     */

class Main extends CI_Controller{

    private $data;

    function __construct()
    {
        parent::__construct();
        $this->load->database();
        //Load page specific javascript (e.g., login-page.js)
        //Load page title
        $this->data = array(
            'page_title' => 'TCOB PhD Student Tracker'
        );
    }

    public function index(){

        if($this->session->userdata('logged_in')){

            $this->load->view('pages/home', $this->data);
        }else{
            redirect('login', 'refresh');
        }

    }
}