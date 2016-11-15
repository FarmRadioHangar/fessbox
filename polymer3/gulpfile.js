const $         = require('gulp-load-plugins')();
const babel     = require('gulp-babel');
const crisper   = require('gulp-crisper');
const gulp      = require('gulp');
const gulpif    = require('gulp-if');
const vulcanize = require('gulp-vulcanize');

gulp.task('vulcanize', () => 
  gulp.src('app/elements/elements.html')
    .pipe(vulcanize({
      stripComments: true,
      inlineScripts: true,
      inlineCss: true
    }))
    .pipe(gulp.dest('dist/elements')));

gulp.task('copy', () =>
  gulp.src([
    'app/bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill,redux}/**/*'
  ]).pipe(gulp.dest('dist/bower_components')));

gulp.task('js', () =>
  gulp.src(['app/**/*.{js,html}', '!app/bower_components/**/*'])
    .pipe($.if('*.html', $.crisper({
      scriptInHead: false
    }))) 
    .pipe($.sourcemaps.init())
    .pipe($.if('*.js', $.babel({
      presets: ['es2015'], 
    })))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('dist/')));

gulp.task('default', ['copy', 'js', 'vulcanize']);
