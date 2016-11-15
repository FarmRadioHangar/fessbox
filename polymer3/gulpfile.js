const babel     = require('gulp-babel');
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
    .pipe(gulpif('*.js', babel({
      presets: ['es2015']
    }))) 
    .pipe(gulp.dest('dist/elements')));

gulp.task('scripts', () => 
  gulp.src('app/scripts/**/*.js')
    .pipe(babel({presets: ['es2015']}))
    .pipe(gulp.dest('dist/scripts'))); 

gulp.task('index', () =>  
  gulp.src('app/index.html')
    .pipe(gulp.dest('dist'))); 

gulp.task('copy', () =>
  gulp.src([
    'app/bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill,redux}/**/*'
  ]).pipe(gulp.dest('dist/bower_components')));

gulp.task('default', ['copy', 'vulcanize', 'scripts', 'index']);
