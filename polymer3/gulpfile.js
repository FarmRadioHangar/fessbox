const $                  = require('gulp-load-plugins')();
const babel              = require('gulp-babel');
const browserSync        = require('browser-sync');
const crisper            = require('gulp-crisper');
const gulp               = require('gulp');
const gulpif             = require('gulp-if');
const historyApiFallback = require('connect-history-api-fallback');
const vulcanize          = require('gulp-vulcanize');
const reload             = browserSync.reload;

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
    'app/bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill,redux,polymer-redux}/**/*'
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

gulp.task('serve', ['default'], () => {
  browserSync({
    port: 5000,
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: (snippet) => snippet
      }
    },
    server: {
      baseDir: ['dist'],
      middleware: [historyApiFallback()]
    }
  })
  gulp.watch(['app/**/*.html', '!app/bower_components/**/*.html'], ['js', reload]);
 //  gulp.watch(['app/styles/**/*.css'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['js', reload]);
  gulp.watch(['app/images/**/*'], reload);
});

gulp.task('default', ['copy', 'js', 'vulcanize']);
