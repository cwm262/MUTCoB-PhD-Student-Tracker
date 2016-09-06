<!DOCTYPE html>
<html lang="en" ng-app="angularApp">
<head>
    <!-- SITE META -->
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title><?php echo isset($page_title) ? $page_title : 'Default Title'; ?> // PHD Student Tracker // Trulaske College of Business, University of Missouri</title>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
    <link href='https://fonts.googleapis.com/css?family=Lato' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/yeti/bootstrap.min.css">
    <?php
        $this->load->helper('html');
        echo link_tag('assets/css/intlTelInput.css');
        echo link_tag('assets/css/base.css');
    ?>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script src="<?php echo base_url();?>assets/js/libraries/intlTelInput.min.js"></script>
    <script src="<?php echo base_url();?>assets/js/libraries/utils.min.js"></script>
    <script src="<?php echo base_url();?>assets/js/dist/main.min.js"></script>
</head>

<body>
<div class="mainHeader navbar navbar-default navbar-fixed-top">
    <div class="navbar-header">
        <button type="button" class="navbar-toggle" ng-init="navCollapsed = true" ng-click="navCollapsed = !navCollapsed">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="<?php echo base_url();?>">
            <img src="<?php echo base_url();?>assets/images/logo-biz.png" alt="TCOB Logo" height="35px"/>
        </a>
    </div>
    <nav class="collapse navbar-collapse" uib-collapse="navCollapsed">
        <ul class="nav navbar-nav">
            <li>
                <a href="<?php echo base_url();?>">PhD Student Tracker</a>
            </li>
            <li>
                <a href ng-click="globalAPI.addStudent()">
                    <span class="glyphicon glyphicon-plus"></span> New
                </a>
            </li>
            <li>
                <a ui-sref="archived">
                    <span class="glyphicon glyphicon-list-alt"></span> &nbsp;Archived
                </a>
            </li>
        </ul>
        <ul class="nav navbar-nav navbar-right" id="userHeader">
            <li uib-dropdown class="dropdown">
                <a href uib-dropdown-toggle>
                    <span class="glyphicon glyphicon-user"></span>&nbsp;<?php echo $this->session->userdata('cn')?>
                    <i class="icon-sort-down"></i>
                </a>
                <ul class="dropdown-menu pull-right" uib-dropdown-menu>
                    <li>
                        <a href="<?php echo base_url();?>logout">Log Out</a>
                    </li>
                </ul>
            </li>
        </ul>
        <form class="navbar-form navbar-right navbar-input-group" role="search">
            <div class="input-group">
                <input class="form-control" placeholder="Search" type="text" ng-model="searchParam">
                <span class="input-group-btn">
                    <button type="submit" class="btn btn-secondary" ng-click="globalAPI.search()"><span class="glyphicon glyphicon-search"></span></button>
                </span>
            </div>
        </form>
    </nav>
</div>
    
<div id="mainContent" class="extra-padding" ui-view>


</div>

<footer class="footer">
    <div id="copyright" class="container-fluid">
        © <?php echo date('Y'); ?> &mdash; Curators of the
        <a href="http://www.umsystem.edu/">University of Missouri</a>. All rights reserved.
        <a href="http://missouri.edu/dmca/">DMCA</a> and
        <a href="http://missouri.edu/copyright/"> other copyright info.</a>.
    </div>
</footer>

</body>
</html>