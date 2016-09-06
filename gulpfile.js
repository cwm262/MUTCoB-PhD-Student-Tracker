

var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_ngmin = require('gulp-ngmin'),
    gp_uglify = require('gulp-uglify'),
    gp_annotate = require('gulp-ng-annotate')
    gp_sourcemaps = require('gulp-sourcemaps');

gulp.task('js-fef', function(){
    return gulp.src([
        'assets/js/angular-libs/api-check.js',
        'assets/js/angular-libs/angular.js',
        'assets/js/angular-libs/betsol-ng-intl-tel-input.js',
        'assets/js/angular-libs/formly.js',
        'assets/js/angular-libs/*.js',
        'assets/js/app.module.js',
        'assets/js/app.constants.js',
        'assets/js/app.config.js',
        'assets/js/app.routes.js',
        'assets/js/controllers/*.js',
        'assets/js/services/app.service.js',
        'assets/js/app.run.js'
    ])
        .pipe(gp_sourcemaps.init())
        .pipe(gp_concat('main.js'))
        .pipe(gp_ngmin())
        .pipe(gulp.dest('assets/js/dist'))
        .pipe(gp_rename({suffix: '.min'}))
        .pipe(gp_annotate())
        .pipe(gp_uglify())
        .pipe(gp_sourcemaps.write('./'))
        .pipe(gulp.dest('assets/js/dist'));
});

gulp.task('default', ['js-fef'], function(){});