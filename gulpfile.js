var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

// 0. Notifications
// 1. Concat and uglify JS
// 2. SASS, autoprefix and minify css
// 3. BrowserSync
// 4. jade
// 5. Copy files and docs if needed
// 6. Minify images
// 7. Replace text for dist folder
// 8. Watch
// 9. FTP

gulp.task('sass', function(){
  return gulp.src('dev/css/*.scss')
    .pipe(sass()) // Using gulp-sass
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
  });
});

gulp.task('watch', ['browserSync', 'sass'], function (){
  gulp.watch('dev/css/*.scss', ['sass']);
});
