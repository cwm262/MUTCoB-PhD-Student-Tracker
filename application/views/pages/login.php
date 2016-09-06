<!DOCTYPE html>
<html lang="en">
<head>
    <!-- SITE META -->
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title><?php echo isset($page_title) ? $page_title : 'Default Title'; ?> // PHD Student Tracker // Trulaske College of Business, University of Missouri</title>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
    <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.6/yeti/bootstrap.min.css" />
    <?php
        $this->load->helper('html');
        echo link_tag('assets/css/base.css');
    ?>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <?php if(isset($js_to_load) && $js_to_load != '') : ?>
        <script src="<?php echo base_url();?>assets/js/<?=$js_to_load;?>"></script>
    <?php endif; ?>
</head>
<body>
    <div class="mainHeader navbar navbar-default navbar-fixed-top">
        <div class="navbar-header">
            <a class="navbar-brand" href="<?php echo base_url();?>">
                <img src="<?php echo base_url();?>assets/images/logo-biz.png" alt="TCOB Logo" height="35px" />
            </a>
        </div>
        <nav class="collapse navbar-collapse" uib-collapse="navCollapsed">
            <ul class="nav navbar-nav">
                <li>
                    <a href="<?php echo base_url();?>">PhD Student Tracker</a>
                </li>
            </ul>
        </nav>
</div>
    
    <div id="mainContent" class="container-fluid extra-padding">

        <div class="col-xs-10 col-xs-offset-1 col-sm-4 col-sm-offset-4 top-buffer">
            <?php
            if($this->session->flashdata("login-error") != NULL || validation_errors() != NULL){
                echo "<div id='login-error-alert' class='alert alert-danger'>";
                echo "\t<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>";
                echo "\t".$this->session->flashdata("login-error");
                echo "\t".validation_errors();
                echo "</div>";
            }
            $attributes = array('class' => 'form-horizontal');
            echo form_open('login', $attributes);
            ?>
            <div class="form-group">
                <label for="user" class="control-label">Pawprint</label>
                <input name="user" class="form-control" id="user" type="text" value="<?php echo set_value('user');?>">
            </div>
            <div class="form-group">
                <label for="password" class="control-label">Password</label>
                <input name="password" class="form-control" id="password" type="password" autocomplete="off" value="<?php echo set_value('password');?>">
            </div>
            <div class="form-group">
                <button type="submit" class="btn btn-default">Login</button>
            </div>
            <?php echo form_close(); ?>
        </div>
    </div>

    <footer class="footer">
        <div id="copyright" class="container-fluid">
            © <?php echo date('Y'); ?> &mdash; Curators of the
            <a href="http://www.umsystem.edu/">University of Missouri</a>. All rights reserved.
            <a href="http://missouri.edu/dmca/">DMCA</a>and
            <a href="http://missouri.edu/copyright/">other copyright info.</a>.
        </div>
    </footer>
</body>
</html>