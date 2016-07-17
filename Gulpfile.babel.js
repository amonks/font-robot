import gulp from 'gulp'

import clean from 'gulp-clean'
import filter from 'gulp-filter'
import flatten from 'gulp-flatten'
import list from 'gulp-filelist'
import sequence from 'gulp-sequence'

import babelify from 'babelify'
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'

gulp.task('clean', () => {
  return gulp.src('./in/**/*', {read: false})
    .pipe(clean())
})

gulp.task('copy', () => {
  return gulp.src('./in/**/*.ttf')
    .pipe(flatten())
    .pipe(gulp.dest('./fonts'))
})

gulp.task('list', () => {
  const f = filter('fonts.json')
  return gulp.src('./fonts/*.ttf')
    .pipe(list('./fonts.json'))
    .pipe(f)
    .pipe(gulp.dest('./'))
})

gulp.task('js', () => {
  return Promise.all([
    browserify({
      entries: './_src/analyze.js',
      debug: true
    })
      .transform(babelify, {presets: ['es2015']})
      .bundle()
      .pipe(source('analyze.js'))
      .pipe(buffer())
      .pipe(gulp.dest('./js')),
    browserify({
      entries: './_src/show.js',
      debug: true
    })
      .transform(babelify, {presets: ['es2015']})
      .bundle()
      .pipe(source('show.js'))
      .pipe(buffer())
      .pipe(gulp.dest('./js'))
  ])
})

gulp.task('import', sequence('copy', 'list', 'clean'))

