<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

/*
 * This file is part of Auth_Ldap.

    Auth_Ldap is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Auth_Ldap is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Auth_Ldap.  If not, see <http://www.gnu.org/licenses />.
 *
 */
/**
 * Auth_Ldap Class
 *
 * Simple LDAP Authentication library for Code Igniter.
 *
 * @package         Auth_Ldap
 * @author          Greg Wojtak <gwojtak@techrockdo.com>
 * @version         0.6
 * @link            http://www.techrockdo.com/projects/auth_ldap
 * @license         GNU Lesser General Public License (LGPL)
 * @copyright       Copyright © 2010,2011 by Greg Wojtak <gwojtak@techrockdo.com>
 * @todo            Allow for privileges in groups of groups in AD
 * @todo            Rework roles system a little bit to a "auth level" paradigm
 */
class Auth_Ldap {
    function __construct() {
        $this->ci =& get_instance();

        // Load the session library
        $this->ci->load->library('session');

        // Load the configuration
        $this->ci->load->config('auth_ldap');

        $this->_init();
    }

    /**
     * @access private
     * @return void
     */
    private function _init() {

        $this->host = $this->ci->config->item('host');
        $this->port = $this->ci->config->item('port');
        $this->basedn = $this->ci->config->item('basedn');
        $this->account_ou = $this->ci->config->item('account_ou');
        $this->login_attribute  = $this->ci->config->item('login_attribute');
        $this->use_ad = $this->ci->config->item('use_ad');
        $this->ad_domain = $this->ci->config->item('ad_domain');
        $this->proxy_user = $this->ci->config->item('proxy_user');
        $this->proxy_pass = $this->ci->config->item('proxy_pass');
        $this->roles = $this->ci->config->item('roles');
        $this->auditlog = $this->ci->config->item('auditlog');
        $this->member_attribute = $this->ci->config->item('member_attribute');

    }

    function inGroup($ldapConnection,$userDN,$groupToFind){
        $filter = "(memberof:1.2.840.113556.1.4.1941:=".$groupToFind.")";
        $search = ldap_search($ldapConnection, $userDN, $filter, array("dn"), 1);
        $items = ldap_get_entries($ldapConnection, $search);
        if(!isset($items["count"])) {
            return false;
        }
        return (bool)$items["count"]; //true if part of the group
    }

    /**
     * @access public
     * @param string $username
     * @param string $password
     */
    function login($username, $password) {

        //Call _authenticate username, password; Set return to user_info
        $user_info = $this->_authenticate($username,$password);

        if($user_info === NULL){
            return NULL;
        }

        // Record the login
        $this->_audit("Successful login: ".$user_info['cn']."(".$username.") from ".$this->ci->input->ip_address());

        // Set the session data
        $customdata = array('username' => $username,
                            'cn' => $user_info['cn'],
                            'dn' => $user_info['dn'],
                            'logged_in' => TRUE);

        $this->ci->session->set_userdata($customdata);

        return TRUE;
    }

    /**
     * @access private
     * @param string $msg
     */
    private function _audit($msg){
        $date = date('Y/m/d H:i:s');
        if (file_exists($this->auditlog)){
            @file_put_contents($this->auditlog, $date.": ".$msg."\n",FILE_APPEND);
        } else{
            @file_put_contents($this->auditlog, $date.": ".$msg."\n");
        }
    }

    /**
     * @access private
     * @param string $username
     * @param string $password
     * @return array or null
     */
    private function _authenticate($username, $password) {
        //$needed_attrs = array('dn', $this->login_attribute, 'cn');

        $this->ldapconn = ldap_connect($this->host, $this->port);

        if(! $this->ldapconn) {
            $this->_audit("Error: Could not make a connection to ldap given host and port.");
            $this->ci->session->set_flashdata("login-error", "There was a problem connecting to the login system. Please contact hogansa@missouri.edu");
            return NULL;
        }

        ldap_set_option($this->ldapconn, LDAP_OPT_REFERRALS, 0);
        ldap_set_option($this->ldapconn, LDAP_OPT_PROTOCOL_VERSION, 3);

        if($this->proxy_user) {
            $bind = ldap_bind($this->ldapconn, $this->proxy_user.'@'.$this->host, $this->proxy_pass);
        }else {
            $bind = ldap_bind($this->ldapconn);
        }

        if(!$bind){
            $this->ci->session->set_flashdata("login-error", "There was a problem connecting to the login system. Please contact hogansa@missouri.edu");
            $this->_audit("Error: Could not connect to ldap with given proxy user name and pass.");
            return NULL;
        }

        $filter = '('.$this->login_attribute.'='.$username.')';
        $search = ldap_search($this->ldapconn, $this->basedn, $filter);
        $entries = ldap_get_entries($this->ldapconn, $search);
        $binddn = $entries[0]['dn'];

        // Now actually try to bind as the user
        $bind = ldap_bind($this->ldapconn, $binddn, $password);
        if(! $bind) {
            $this->ci->session->set_flashdata("login-error", "Sorry. Either your pawprint or your password was incorrect.");
            $this->_audit("Failed login attempt: ".$username." from ".$_SERVER['REMOTE_ADDR']);
            return NULL;
        }

        $cn = $entries[0]['cn'][0];
        //No user found. Return null
        if($cn === NULL){
            $this->ci->session->set_flashdata("login-error", "Sorry. Either your pawprint or your password was incorrect.");
            $this->_audit("Failed login attempt: ".$username." from ".$_SERVER['REMOTE_ADDR']);
            return NULL;
        }
        $dn = stripslashes($entries[0]['dn']);
        $id = $username;
        //$memberOf = $entries[0]['memberof'];
        $newdn = $entries[0]['dn'];
        $newdn= preg_replace('/\\\\+/', '\\', $newdn);
        if($this->inGroup($this->ldapconn, $newdn, "CN=MU BUS PHDDB Admins,OU=PHD,OU=Applications,OU=COB,OU=MU,DC=col,DC=missouri,DC=edu")){
            return array('cn' => $cn, 'dn' => $dn, 'id' => $id);
        }else{
            $this->ci->session->set_flashdata("login-error", "Sorry. Either your pawprint or your password was incorrect.");
            $this->_audit("Failed login attempt: ".$username." from ".$_SERVER['REMOTE_ADDR']);
            return NULL;
        }

        //(memberof:1.2.840.113556.1.4.1941:=CN=COB Dashboard Departments UGAdvising Demographics,OU=Dashboards,OU=Applications,OU=COB,OU=MU,DC=col,DC=missouri,DC=edu)

    }

    /**
     * @access private
     * @param string $username
     * @return int
     */
    private function _get_role($username) {

        /*
        $filter = '('.$this->member_attribute.'='.$username.')';
        $search = ldap_search($this->ldapconn, $this->basedn, $filter, array('cn'));
        if(! $search ) {
            log_message('error', "Error searching for group:".ldap_error($this->ldapconn));
            show_error('Couldn\'t find groups: '.ldap_error($this->ldapconn));
        }
        $results = ldap_get_entries($this->ldapconn, $search);
        if($results['count'] != 0) {
            for($i = 0; $i < $results['count']; $i++) {
                $role = array_search($results[$i]['cn'][0], $this->roles);
                if($role !== FALSE) {
                    return $role;
                }
            }
        }
        return false;
        */

        //if(strcmp($username, "cwm262") == 0){
        //    $role = array_search("User", $this->roles);
        //    if(!empty($role)){
        //        return $role;
        //    }
        //}

        return 0;

    }
}

?>