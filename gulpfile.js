const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const concat = require('gulp-concat')
const babel = require('gulp-babel')
const iife = require("gulp-iife")
const header = require('gulp-header')
const strip_comments = require('gulp-strip-comments')
const zip = require('gulp-zip')

const banner = [
  '// lab.js -- Building blocks for online experiments',
  '// (c) 2015- Felix Henninger',
  '\n'
  ].join('\n');

const combine = function() {
  return gulp.src([
      'src/base.js',
      'src/core.js',
      'src/core-flow.js',
      'src/core-display-html.js',
      'src/core-display-canvas.js',
      'src/data.js'
    ])
  	.pipe(sourcemaps.init())
}

gulp.task('bundle', function() {
  return combine()
    .pipe(concat('lab.es6.js'))
    .pipe(strip_comments())
    .pipe(header(banner))
    .pipe(gulp.dest('dist'));
})

gulp.task('transpile', function() {
  return combine()
    .pipe(concat('lab.js'))
    .pipe(babel({
      presets: ['es2015'],
      comments: false,
      sourceMaps: true,
      moduleIds: true,
      moduleId: 'lab.js'
    }))
    .pipe(iife({
      useStrict: false, // already added by babel
      params: ['exports'],
      args: ["typeof exports === 'undefined' ? this['lab'] = {} : exports"]
    }))
    .pipe(header(banner))
  	.pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('starterkit', function() {
  // Copy library into starterkit folder
  gulp.src('dist/lab.js')
    .pipe(gulp.dest('dist/labjs-starterkit/lib'))

  // Copy auxiliary files into starterkit folder
  gulp.src('src/starterkit/**/*')
    .pipe(gulp.dest('dist/labjs-starterkit/'))

  // Create zip file
  return gulp.src('dist/labjs-starterkit/**/*', {base: 'dist'})
    .pipe(zip('starterkit.zip'))
    .pipe(gulp.dest('dist'))
})

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['bundle', 'transpile', 'starterkit']);
});

gulp.task('default', ['bundle', 'transpile', 'starterkit', 'watch']);
