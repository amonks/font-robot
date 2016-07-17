import gulp from 'gulp'

import babel from 'gulp-babel'
import clean from 'gulp-clean'
import filter from 'gulp-filter'
import flatten from 'gulp-flatten'
import list from 'gulp-filelist'
import sequence from 'gulp-sequence'

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
  return gulp.src('./_src/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./'))
})


gulp.task('import', sequence('copy', 'list', 'clean'))

