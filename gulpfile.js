const gulp = require('gulp');
const babel = require('gulp-babel');
const webpack = require('gulp-webpack');
const path = require('path');

gulp.task('babel', (done) => {
  gulp.src('server.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'))
    done();
});


gulp.task('webpack', (done) => {
  gulp.src('js/main.js')
    .pipe(webpack({
      output: {
        filename: 'app.js',
      },
    }))
    .pipe(gulp.dest('public/js/'));
    done();
});

gulp.task('build', gulp.parallel('babel', 'webpack'));

