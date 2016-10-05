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
  var vfs = require('vinyl-fs');
  var webserver = require('gulp-webserver');

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
    .pipe(gulp.dest('./site'))
  });

  gulp.task('styleguide', ['sass'], function() {
    return kss({
      source: 'src',
      destination: 'styleguide',
      css: '../site/styles.css'
    });
  });

  gulp.task('html', function() {
    return gulp.src('./src/pages/*.hbs')
    .pipe(handlebars({}, {
      ignorePartials: true,
      batch: ['./src/partials', './src/partials/components']
    }))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest('./site'));
  });

  gulp.task('watch', function() {
    gulp.watch('./src/sass/**/*.scss', ['styleguide']);
    gulp.watch('./src/partials/**/*.hbs', ['html', 'styleguide']);
    gulp.watch('./src/pages/**/*.hbs', ['html']);
  });

  gulp.task('symlink-images', function() {
    return vfs.src('images', { followSymlinks: false })
    .pipe(vfs.symlink('site'))
    .pipe(vfs.symlink('styleguide'));
  });

  gulp.task('webserver-site', function() {
    gulp.src('site')
      .pipe(webserver({
        host: 'localhost',
        port: '8080',
        open: true,
      }));
  });

  gulp.task('webserver-styleguide', function() {
    gulp.src('styleguide')
      .pipe(webserver({
        host: 'localhost',
        port: '7070',
        open: true,
      }));
  });


  gulp.task('setup', ['sass', 'html', 'styleguide', 'symlink-images', 'webserver-site', 'webserver-styleguide']);
  gulp.task('default', ['sass', 'html', 'styleguide', 'webserver-site', 'webserver-styleguide', 'watch']);
}());
