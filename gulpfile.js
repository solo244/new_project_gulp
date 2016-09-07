// Custom
var project = "new_project_gulp";
// --
var gulp = require('gulp'),
    notify = require('gulp-notify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    gulpIf = require('gulp-if'),
    rename = require("gulp-rename"),
    sass = require('gulp-sass'),
    cssnano = require('gulp-cssnano'),
    autoprefixer = require('gulp-autoprefixer'),
    jade = require('gulp-jade'),
    filter = require('gulp-filter'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    del = require('del'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync').create();

// Prevent erros
var plumber = require('gulp-plumber'); //new

// 1. Concat and uglify JS
gulp.task('js', function(){
  return gulp.src('dev/js/main/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(notify({title: 'JS', message: 'Done with JS', onLast: true}))
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('vendors', function(){
  return gulp.src('dev/js/vendor/*.js')
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));
});

// 2. SASS, autoprefix CSS & minify CSS
gulp.task('css', function(){
  return gulp.src('dev/css/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer({browsers: ['last 2 versions', 'ie >= 8', 'Firefox ESR']}))
    .pipe(cssnano())
    .pipe(sourcemaps.write('.'))
    .pipe(rename("style.min.css"))
    .pipe(notify({title: 'CSS', message: 'Done with CSS', onLast: true}))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.reload({ stream: true }));
});

// 3. Compile Jade
gulp.task('jade', function(){
  return gulp.src('dev/content/**/*.jade')
    .pipe(filter(function (file) {
        return !/\/_/.test(file.path) && !/^_/.test(file.relative);
    }))
    .pipe(jade({ pretty: true, basedir: "dev/content/_template/" }))
    .pipe(notify({title: 'Jade', message: 'Done with Jade', onLast: true}))
    .pipe(gulp.dest('build'))
    .pipe(browserSync.reload({ stream: true }));
});

// 4. Optimize images
gulp.task('images', function(){
  return gulp.src('dev/images/**/*.+(png|jpg|gif|svg|ico)')
    //.pipe(cache(imagemin()))
    .pipe(notify({title: 'Images', message: 'Done with images', onLast: true}))
    .pipe(gulp.dest('build/images')
  );
});

// 5. Copy fonts
gulp.task('fonts', function(){
  return gulp.src('dev/css/fonts/**/*')
    .pipe(gulp.dest('build/css/fonts')
  );
});

// 6. Copy files to ftp folder dist
gulp.task('dist', function(){
  runSequence("vendors", "js", "css", "jade", "images", "fonts");

  del.sync('dist');
  gulp.src('build/**')
    .pipe(gulp.dest('dist/')
  );
  return;
});

// 7. Replace text for dist folder

// 8. FTP

// For the cleaning of the dist directory


gulp.task('default', function() {
  runSequence("vendors", "js", "css", "jade", "images", "fonts");
  browserSync.init({
    proxy: "http://localhost/" + project + "/build/"
  });
  gulp.watch("dev/css/**/*.scss", ["css"]);
  gulp.watch("dev/content/**/*.jade", ["jade"]).on('change', browserSync.reload);
  gulp.watch("dev/js/**/*.js", ["js"]).on('change', browserSync.reload);
});
