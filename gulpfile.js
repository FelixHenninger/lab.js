const gulp = require('gulp')
const zip = require('gulp-zip')
const webpack = require('webpack-stream')

gulp.task('bundle', function() {
  return gulp.src('src/index.js')
    .pipe(webpack( require('./webpack.config.js') ))
    .pipe(gulp.dest('dist'));
})

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
  gulp.watch('src/*.js', ['bundle', 'starterkit']);
});

gulp.task('default', ['bundle', 'starterkit', 'watch']);
