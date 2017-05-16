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
    //gulpIf = require('gulp-if'),
    rename = require("gulp-rename"),
    sass = require('gulp-sass'),
    cssnano = require('gulp-cssnano'),
    autoprefixer = require('gulp-autoprefixer'),
    pug = require('gulp-pug'),
    filter = require('gulp-filter'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    //del = require('del'),
    //replace = require('gulp-replace'),
    runSequence = require('run-sequence'),
    webserver = require('gulp-webserver');

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
    //.pipe(notify({title: 'JS', message: 'Done with JS', onLast: true}))
    .pipe(gulp.dest(buildPath + 'js')
    //.pipe(browserSync.reload({ stream: true })
  );
});

gulp.task('vendors', function(){
  return gulp.src(assetPath + 'js/vendor/*.js')
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    //.pipe(notify({title: 'JS vendors', message: 'Done with JS vendors', onLast: true}))
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
    //.pipe(notify({title: 'CSS', message: 'Done with CSS', onLast: true}))
    .pipe(gulp.dest(buildPath + 'css')
    //.pipe(browserSync.reload({ stream: true })
  );
});

// 3. Compile Pug
gulp.task('pug', function(){
  return gulp.src(assetPath + 'views/**/*.pug')
    .pipe(filter(function (file) {
        return !/\/_/.test(file.path) && !/^_/.test(file.relative);
    }))
    .pipe(pug({ pretty: true, basedir: assetPath + 'views/_layout' }))
    //.pipe(notify({title: 'Jade', message: 'Done with Jade', onLast: true}))
    .pipe(gulp.dest(buildPath + '')
    //.pipe(browserSync.reload({ stream: true })
  );
});

// 4. Optimize images
gulp.task('images', function(){
  return gulp.src(assetPath + 'images/**/*.+(png|jpg|gif|svg|ico)')
    .pipe(cache(imagemin()))
    //.pipe(notify({title: 'Images', message: 'Done with images', onLast: true}))
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
  gulp.src(['dist/**/*.html'])
    .pipe(replace({
      patterns: [
        {
          match: '/new_project_gulp/build',
          replacement: 'mo'
        }
      ]
    }))
    //.pipe(notify({title: 'Dist', message: 'Dist folder ready', onLast: true}))
    .pipe(gulp.dest('dist/')
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
gulp.task('default', function() {
  runSequence("vendors", "js", "css", "pug", "images", "fonts", "webserver");
});

gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(notify({title: 'Server', message: 'Booting server', onLast: true}))
    .pipe(webserver({
      path: "build/",
      livereload: true,
      open: true,
      fallback: "./build/index.html"
    })
  );
  gulp.watch(assetPath + "css/**/*.scss", ["css"]);
  gulp.watch(assetPath + "views/**/*.pug", ["pug"]);
  gulp.watch(assetPath + "js/main/*.js", ["js"]);
  gulp.watch(assetPath + "js/vendor/*.js", ["vendors"]);
});
