# TCOB PhD Student Tracker Application #

This project allows faculty and staff to keep track of PhD students. e.g., access education history, look up test scores, find addresses, upload/download forms, etc.

* PRODUCTION: https://apps.business.missouri.edu/phd/students

### Instructions ###

* This assumes your environment already has Git, NPM, Gulp, etc.
* Clone repository.
* Update base URL in PHP: Line 29, /application/config/config.php
* Update database variables in /application/config/database.php
* Update LDAP variables if necessary in /application/config/auth_ldap.php 
* Update base URL in JS: Line 8, /assets/js/app.constants.js
* Run `npm update` with BASH in root directory.
* Run `gulp` with BASH in root directory.