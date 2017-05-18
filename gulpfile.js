var project = "new_project_gulp", // Local folder name
    folder = "", // Online folder, empty if root
    assetPath = "dev/", // Local asset path
    buildPath = "build/"; // Local build path
    distPath = "dist/"; // Remote asset path

var gulp = require('gulp'),
    notify = require('gulp-notify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    rename = require("gulp-rename"),
    sass = require('gulp-sass'),
    cssnano = require('gulp-cssnano'),
    autoprefixer = require('gulp-autoprefixer'),
    pug = require('gulp-pug'),
    filter = require('gulp-filter'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    del = require('del'),
    replace = require('gulp-replace'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync');

// 0. ErrorHandler
function handleError(error) {
  console.error(error.message);
  this.emit('end');
}

// 1. Concat and uglify JS
gulp.task('js', function(){
  return gulp.src(assetPath + 'js/main/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(buildPath + 'js'))
    .pipe(browserSync.reload({ stream: true })
  );
});

gulp.task('vendors', function(){
  return gulp.src(assetPath + 'js/vendor/*.js')
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(buildPath + 'js')
  );
});

// 2. SASS, autoprefix CSS & minify CSS
gulp.task('css', function(){
  return gulp.src(assetPath + 'css/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer({browsers: ['last 2 versions', 'ie >= 8', 'Firefox ESR']}))
    .pipe(cssnano())
    .pipe(sourcemaps.write('.'))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest(buildPath + 'css'))
    .pipe(browserSync.reload({ stream: true })
  );
});

// 3. Compile Pug
gulp.task('pug', function(){
  return gulp.src([assetPath + 'views/**/*.pug', !assetPath + 'views/_template/**/*.pug'])
    .pipe(filter(function (file) {
        return !/\/_/.test(file.path) && !/^_/.test(file.relative);
    }))
    .pipe(pug({ pretty: true, basedir: assetPath + 'views/_layout' }))
    .pipe(gulp.dest(buildPath + ''))
    .pipe(browserSync.reload({ stream: true })
  );
});

// 4. Optimize images
gulp.task('images', function(){
  return gulp.src(assetPath + 'images/**/*.+(png|jpg|gif|svg|ico)')
    .pipe(cache(imagemin()))
    .pipe(gulp.dest(buildPath + 'images')
  );
});

// 5. Copy fonts
gulp.task('fonts', function(){
  return gulp.src(assetPath + 'css/fonts/**/*')
    .pipe(gulp.dest(buildPath + 'css/fonts')
  );
});

// 6. Copy files to ftp folder dist
gulp.task('dist', function(){
  runSequence("vendors", "js", "css", "pug", "images", "fonts", "copy", "replace");
});

// 7. Replace text for dist folder
gulp.task('replace', function(){
  gulp.src([distPath + '**/*.html'])
    .pipe(replace({
      patterns: [
        {
          match: '/new_project_gulp/build',
          replacement: 'mo'
        }
      ]
    }))
    .pipe(notify({title: 'Preparing ...', message: 'Dist folder ready', onLast: true}))
    .pipe(gulp.dest(distPath + '')
  );
});

// 8. Copy all files from build to dist folder
gulp.task('copy', function(){
  del.sync(distPath + '');
  gulp.src(buildPath + '**')
    .pipe(gulp.dest(distPath + '')
  );
  return;
});

// 9. FTP
/*
 * Still add the option to ftp via Gulp
 */

// Default gulp task
gulp.task('default', function(){
  browserSync({server: "./" + buildPath});
  runSequence("vendors", "js", "css", "pug", "images", "fonts", "update");
});

gulp.task('update', function() {
  gulp.watch(assetPath + "css/**/*.scss", ["css"]);
  gulp.watch(assetPath + "views/**/*.pug", ["pug"]).on('change', browserSync.reload);
  gulp.watch(assetPath + "js/main/*.js", ["js"]).on('change', browserSync.reload);
  gulp.watch(assetPath + "js/vendor/*.js", ["vendors"]).on('change', browserSync.reload);
  gulp.watch(assetPath + "css/fonts/*", ["fonts"]).on('change', browserSync.reload);
  gulp.watch(assetPath + "images/*", ["images"]).on('change', browserSync.reload);
});
