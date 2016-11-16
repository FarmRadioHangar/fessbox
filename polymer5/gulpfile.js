'use strict';

const path   = require('path');
const gulp   = require('gulp');
const gulpif = require('gulp-if');

// Keep the global.config above any of the gulp-tasks that depend on it
global.config = {
  polymerJsonPath: path.join(process.cwd(), 'polymer.json'),
  build: {
    rootDirectory: 'build',
    bundledDirectory: 'bundled',
    unbundledDirectory: 'unbundled',
    bundleType: 'bundled' // Accepts either 'bundled', 'unbundled', or 'both'
  },
  // Path to service worker, relative to the build root directory
  serviceWorkerPath: 'service-worker.js',
  // Service Worker precache options based on
  // https://github.com/GoogleChrome/sw-precache#options-parameter
  swPrecacheConfig: {
    navigateFallback: '/index.html'
  }
};

// A task should return either a WriteableStream or a Promise
const clean   = require('./gulp-tasks/clean.js');
const images  = require('./gulp-tasks/images.js');
const project = require('./gulp-tasks/project.js');
const babel   = require('gulp-babel');

// The source task will split all source files into one big ReadableStream. 
// Source files are those in src/** as well as anything added to the 
// sourceGlobs property of polymer.json.
function source() {
  return project.splitSource()
    // Add build tasks here
    .pipe(gulpif('*.js', babel({
      presets: ['es2015']
    })))
    .pipe(gulpif('**/*.{png,gif,jpg,svg}', images.minify()))
    .pipe(project.rejoin()); // Call rejoin when you're finished
}

function dependencies() {
  return project.splitDependencies()
    .pipe(project.rejoin());
}

// Clean the build directory, split all source and dependency files into streams
// and process them, and output bundled and unbundled versions of the project
// with their own service workers
gulp.task('default', gulp.series([
  clean([global.config.build.rootDirectory]),
  project.merge(source, dependencies),
  project.serviceWorker
]));
