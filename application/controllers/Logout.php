<?php

    /*
     * Handles LogOut functionality
     *
     */

class Logout extends CI_Controller
{
    //Logout the user
    public function index(){
        session_destroy();
        //Redirect to login
        redirect('login', 'refresh');

    }
}