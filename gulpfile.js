const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const iife = require("gulp-iife");
const header = require('gulp-header');
const strip_comments = require('gulp-strip-comments')

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

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['bundle', 'transpile']);
});

gulp.task('default', ['bundle', 'transpile', 'watch']);
