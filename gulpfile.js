var project   = "new_project_gulp", // Local folder name
    folder    = "sandbox/blurg", // Online folder, empty if root
    assetPath = "dev/", // Local asset path
    buildPath = "build/", // Local build path
    distPath  = "dist/"; // Local dist path

var gulp = require('gulp'),
    fs = require('fs'),
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
    gulpSequence = require('gulp-sequence'),
    ftp = require('vinyl-ftp'),
    browserSync = require('browser-sync');

// ErrorHandler
function handleError(error) {
  console.error(error.message);
  this.emit('end');
}

// Concat and uglify JS
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

// SASS, autoprefix CSS & minify CSS
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

// Compile Pug
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

// Optimize images
gulp.task('images', function(){
  return gulp.src(assetPath + 'images/**/*.+(png|jpg|gif|svg|ico)')
    .pipe(cache(imagemin()))
    .pipe(gulp.dest(buildPath + 'images')
  );
});

// Copy fonts
gulp.task('fonts', function(){
  return gulp.src(assetPath + 'css/fonts/**/*')
    .pipe(gulp.dest(buildPath + 'css/fonts')
  );
});

// Copy all files from build to dist folder
gulp.task('copy', function(){
  del.sync(distPath + '');
  return gulp.src(buildPath + '**')
    .pipe(gulp.dest(distPath + '')
  );
});

// Replace text for dist folder
gulp.task('replace', ['copy'], function(){
  return gulp.src([distPath + '**/*.html'])
    .pipe(replace(/src="\//g, 'src="/' + folder + '/'))
    .pipe(replace(/href="\//g, 'href="/' + folder + '/'))
    .pipe(gulp.dest(distPath + '')
  );
});

// FTP
gulp.task('deploy', ['replace'], function() {
  var cleanJSON = require("strip-json-comments");
  var config = fs.readFileSync(".ftppass", "utf8");
  config = JSON.parse(cleanJSON(config));
  var globs = [distPath + '**'];

  var conn = ftp.create( {
    host:     config.kvd.server,
    user:     config.kvd.username,
    password: config.kvd.password
  });

  return gulp.src( globs, { base: distPath, buffer: false } )
    .pipe( conn.newer('/httpdocs/' + folder + '/'))
    .pipe( conn.dest('/httpdocs/' + folder + '/')
  );
});

// Clear dist folder after publish
gulp.task('delete', ['deploy'], function(){
  del.sync(distPath + '');
  return;
});

/*
 * Default gulp task
 */
gulp.task('default', gulpSequence("vendors", "js", "css", "pug", "images", "fonts", "update"));

gulp.task('update', function() {
  browserSync({server: "./" + buildPath});
  gulp.watch(assetPath + "css/**/*.scss", ["css"]);
  gulp.watch(assetPath + "views/**/*.pug", ["pug"]).on('change', browserSync.reload);
  gulp.watch(assetPath + "js/main/*.js", ["js"]).on('change', browserSync.reload);
  gulp.watch(assetPath + "js/vendor/*.js", ["vendors"]).on('change', browserSync.reload);
  gulp.watch(assetPath + "css/fonts/*", ["fonts"]).on('change', browserSync.reload);
  gulp.watch(assetPath + "images/*", ["images"]).on('change', browserSync.reload);
});

/*
 * Deployment gulp task via ftp
 */
gulp.task('ftp', function (cb) {
  gulpSequence("vendors", "js", "css", "pug", "images", "fonts", "copy", "replace", "deploy", "delete")(cb);
});
