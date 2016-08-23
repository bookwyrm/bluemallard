/* globals require, console */
(function() {
  'use strict';

  var gulp = require('gulp');
  var sass = require('gulp-sass');
  var autoprefixer = require('gulp-autoprefixer');
  var plumber = require('gulp-plumber');
  var gutil = require('gulp-util');
  var kss = require('kss');
  var handlebars = require('gulp-compile-handlebars');
  var rename = require('gulp-rename');

  var onError = function(err) {
    console.log('An error ocurred: ', gutil.colors.magenta(err.message));
    gutil.beep();
    this.emit('end');
  };

  gulp.task('sass', function() {
    return gulp.src('./src/sass/**/*.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('./dist'))
  });

  gulp.task('styleguide', ['sass'], function() {
    return kss({
      source: 'src',
      destination: 'generated-styleguide',
      css: '../dist/styles.css'
    });
  });

  gulp.task('html', function() {
    return gulp.src('./src/pages/*.hbs')
    .pipe(handlebars({}, {
      ignorePartials: true,
      batch: ['./src/partials']
    }))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest('./dist'));
  });

  gulp.task('watch', function() {
    gulp.watch('./src/sass/**/*.scss', ['styleguide']);
    gulp.watch('./src/partials/**/*.hbs', ['html']);
    gulp.watch('./src/pages/**/*.hbs', ['html']);
  });

  gulp.task('default', ['sass', 'styleguide', 'watch']);
}());
