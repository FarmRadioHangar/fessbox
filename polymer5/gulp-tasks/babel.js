'use strict';

const $       = require('gulp-load-plugins')();
const babel   = require('gulp-babel');
const crisper = require('gulp-crisper');
const gulp    = require('gulp');
const gulpif  = require('gulp-if');

function transpile() {
  return gulp.src(['app/**/*.{js,html}', '!app/bower_components/**/*'])
    .pipe($.if('*.html', $.crisper({scriptInHead: false}))) 
    .pipe($.sourcemaps.init())
    .pipe(gulpif('*.js', $.babel({
      presets: ['es2015']
    })))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/'))
    .pipe(gulp.dest('dist/'));
}

module.exports = {
  transpile: transpile
};
