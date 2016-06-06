var project = "new_project_gulp";
// --
var gulp = require('gulp');
var rename = require("gulp-rename");
var del = require('del');
var runSequence = require('run-sequence');
// CSS
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
// Sync
var browserSync = require('browser-sync').create();
// JS
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
// Jade
var jade = require('gulp-jade');
var cached = require('gulp-cached');
var filter = require('gulp-filter');
// Images
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');

// 0. Notifications
// 1. Concat and uglify JS --
// 2. autoprefix
// 3. BrowserSync --
// 4. jade --
// 5. Copy files and docs if needed
// 6. Minify images
// 7. Replace text for dist folder
// 8. Watch
// 9. FTP

// SASS, autoprefix and minify css
gulp.task('sass', function(){
  return gulp.src('dev/css/*.scss')
    .pipe(sass())
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(rename("css/style.css"))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({ stream: true })
  );
});

gulp.task('jade', function() {
  return gulp.src('dev/content/**/*.jade')
    .pipe(filter(function (file) {
        return !/\/_/.test(file.path) && !/^_/.test(file.relative);
    }))
    .pipe(jade({ pretty: true, basedir: "dev/content/_template/" }))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({ stream:true })
  );
});

gulp.task('useref', function(){
  return gulp.src('dist/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist')
  );
});

gulp.task('images', function(){
  return gulp.src('dev/images/**/*.+(png|jpg|gif|svg)')
    .pipe(cache(imagemin()))
    .pipe(gulp.dest('dist/images')
  );
});

gulp.task('fonts', function() {
  return gulp.src('dev/css/fonts/**/*')
    .pipe(gulp.dest('dist/css/fonts')
  );
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
});

gulp.task('default', function() {
  runSequence("clean:dist", "jade", "sass", "useref", "images", "fonts");
  // Open a local server
  browserSync.init({
    proxy: "http://localhost/" + project + "/dist/"
  });
  // Add watch function for CSS, HTML and JS
  gulp.watch("dev/css/**/*.scss", ["sass"]);
  gulp.watch("dev/content/**/*.jade", ["jade", "useref"]).on('change', browserSync.reload);
  gulp.watch("dev/content/js/*.js", ["jade", "useref"]).on('change', browserSync.reload);
});

//gulp.task('default', ['serve']);
