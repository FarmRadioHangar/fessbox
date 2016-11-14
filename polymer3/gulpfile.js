const gulp  = require('gulp');  
const babel = require('gulp-babel');
const vulcanize = require('gulp-vulcanize');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const historyApiFallback = require('connect-history-api-fallback');

gulp.task('scripts', () => 
  gulp.src('app/elements/**/*.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(gulp.dest('dist/elements/'))); 

gulp.task('html', () =>  
  gulp.src('app/elements/**/*.html')
    .pipe(gulp.dest('dist/elements/'))); 

gulp.task('css', () => 
  gulp.src('app/elements/**/*.css')
    .pipe(gulp.dest('dist/elements/'))); 

gulp.task('vulcanize', () => {
  return gulp.src('app/elements/elements.html')
    .pipe(vulcanize({
      stripComments: true,
      inlineScripts: true,
      inlineCss: true
    }))
    .pipe(gulp.dest('dist/elements'));
});

gulp.task('serve', ['css', 'scripts'], () => {
  browserSync({
    port: 5000,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    server: {
      baseDir: ['.tmp', 'app'],
      middleware: [historyApiFallback()]
    }
  });

  gulp.watch(['app/**/*.html', '!app/bower_components/**/*.html'], ['scripts', reload]);
  gulp.watch(['app/styles/**/*.css'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['scripts', reload]);
  gulp.watch(['app/images/**/*'], reload);
});

gulp.task('serve:dist', ['default'], () => {
  browserSync({
    port: 5001,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    server: dist(),
    middleware: [historyApiFallback()]
  });
});

gulp.task('default', ['scripts', 'css', 'html', 'vulcanize']);
