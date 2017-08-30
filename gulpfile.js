var gulp = require('gulp');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');
var streamqueue = require('streamqueue');
var fs = require('fs');

gulp.task('default', ['minify', 'connect', 'watch']);

gulp.task('connect', function () {
  connect.server({
    root: ['demo', './'],
    livereload: true,
  });
});

gulp.task('reload', ['minify'], function () {
  gulp.src(['./src/**', './demo/**']).pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['./src/**', './demo/**'], ['reload']);
});

gulp.task('minify', function () {
  var files = ["src/angularSchemaFormPreviewer.js", "src/**/*.js"];
  var stream = streamqueue({ objectMode: true },
    gulp.src(files),
    gulp.src(['src/templates/**/*.html']).pipe(templateCache({
      standalone: true,
      root: 'src/templates/',
    }))
  )
  .pipe(concat('angular-schema-form-previewer.js'))
  .pipe(gulp.dest('.'))
  .pipe(uglify({ output: { comments: 'some' } }))
  .pipe(rename('angular-schema-form-previewer.min.js'))
  .pipe(gulp.dest('.'));

  return stream;
});
