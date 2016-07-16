import gulp from 'gulp'
import clean from 'gulp-clean'
import flatten from 'gulp-flatten'
import list from 'gulp-filelist'
import filter from 'gulp-filter'
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

gulp.task('import', sequence('copy', 'list', 'clean'))

