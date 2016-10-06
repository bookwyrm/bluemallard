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
  var livereload = require('gulp-livereload');

  var onError = function(err) {
    console.log('An error ocurred: ', gutil.colors.magenta(err.message));
    gutil.beep();
    this.emit('end');
  };

  gulp.task('sass-site', function() {
    return gulp.src('./src/sass/styles.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('./site'))
    .pipe(livereload())
  });

  gulp.task('sass-styleguide', function() {
    return gulp.src('./src/sass/styleguide.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('./styleguide'))
    .pipe(livereload())
  });

  gulp.task('generate-styleguide', ['sass-styleguide'], function() {
    return kss({
      source: 'src',
      destination: 'styleguide',
      css: 'styleguide.css',
      builder: 'styleguide-builder'
    });
  });

  gulp.task('generate-site', function() {
    return gulp.src('./src/pages/*.hbs')
    .pipe(handlebars({}, {
      ignorePartials: true,
      batch: ['./src/partials', './src/partials/components']
    }))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest('./site'))
    .pipe(livereload())
    ;
  });

  gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('./src/sass/**/*.scss', ['sass-styleguide', 'sass-site', 'styleguide']);
    gulp.watch('./src/partials/**/*.hbs', ['generate-site', 'generate-styleguide']);
    gulp.watch('./src/pages/**/*.hbs', ['generate-site']);
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

  gulp.task('copy-ffo', function() {
    gulp.src('bower_components/fontfaceobserver/fontfaceobserver.js')
    .pipe(rename('fontfaceobserver.hbs'))
    .pipe(gulp.dest('src/partials/static'))
  });

  gulp.task('setup', ['sass-site', 'sass-styleguide', 'generate-site', 'generate-styleguide', 'symlink-images']);
  gulp.task('default', ['sass-site', 'sass-styleguide', 'generate-site', 'generate-styleguide', 'webserver-site', 'webserver-styleguide', 'watch']);
  gulp.task('styleguide', ['sass-styleguide', 'generate-styleguide', 'webserver-styleguide']);
}());
