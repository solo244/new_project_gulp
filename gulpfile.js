// Custom
var project = "new_project_gulp";
// --
var gulp = require('gulp');
var rename = require("gulp-rename");
var del = require('del');
var runSequence = require('run-sequence');
// CSS
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps'); //new
var cleanCss = require('gulp-clean-css'); //new
var autoprefixer = require('gulp-autoprefixer'); //new
// Sync
var browserSync = require('browser-sync').create();
// JS
var useref = require('gulp-useref');
var concat = require('gulp-concat'); //new
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
// Jade
var jade = require('gulp-jade');
var cached = require('gulp-cached');
var filter = require('gulp-filter');
// Images
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
// Prevent erros
var plumber = require('gulp-plumber'); //new
// Notifications
var notify = require('gulp-notify'); //new

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
    .pipe(gulp.dest('build'))
    .pipe(browserSync.reload({ stream: true })
  );
});

// Compile Jade to HTML
gulp.task('jade', function() {
  return gulp.src('dev/content/**/*.jade')
    .pipe(filter(function (file) {
        return !/\/_/.test(file.path) && !/^_/.test(file.relative);
    }))
    .pipe(jade({ pretty: true, basedir: "dev/content/_template/" }))
    .pipe(gulp.dest('build'));

});

gulp.task('useref', function(){
  return gulp.src('build/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('build')
  );
});

gulp.task('images', function(){
  return gulp.src('dev/images/**/*.+(png|jpg|gif|svg)')
    .pipe(cache(imagemin()))
    .pipe(gulp.dest('build/images')
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





var lessFiles = fs.readdirSync(themeTelepsyRoot + 'compilers/less')
    .filter(function (name) {
        return name.substr(-5) === '.less';
    })
    .map(function (name) {
        return name.substr(0, name.length - 5);
    });

var themeJs = ['lib', 'app'];
var moduleJs = ['chat', 'util.badges', 'util.create_test', 'util.ehealth_form', 'util.execution'];

var themeRoots = fs.readdirSync(themesRoot)
    .filter(function (name) {
        return name.indexOf('theme_') === 0 && name != 'theme_telepsy_old';
    })
    .map(function (name) {
        return themesRoot + name + '/';
    });

gulp.task('default', ['watch']);
gulp.task('build', ['build:less', 'build:js']);
gulp.task('watch', ['watch:less', 'watch:js']);
gulp.task('minify', ['minify:less', 'minify:js']);

function compileLess(baseName) {
    return gulp.src(themeTelepsyRoot + 'compilers/less/' + baseName + '.less')
        .pipe(plumber({errorHandler: notify.onError('Error compiling: ' + baseName + "\n" + '<%= error.message %>')}))
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({browsers: ['last 2 versions', 'ie >= 8', 'Firefox ESR']}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(themeTelepsyRoot + 'assets/css'));
}

function compileColorScheme(themeRoot) {
    return gulp.src(themeRoot + 'compilers/less/colorscheme.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({browsers: ['last 2 versions', 'ie >= 8', 'Firefox ESR']}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(themeRoot + 'assets/css'));
}

lessFiles.forEach(function(file) {
    gulp.task('less:' + file, function() {
        compileLess(file);
    });
});

gulp.task('less:colorscheme', function() {
    var tasks = themeRoots.map(function(themeRoot) {
        return compileColorScheme(themeRoot);
    });

    return merge(tasks);
});

gulp.task('build:less', lessFiles.map(function(key) { return 'less:' + key; }).concat('less:colorscheme'));

gulp.task('minify:less', ['build:less'], function() {
    var streams = [];

    streams.push(gulp.src(themeTelepsyRoot + 'assets/css/*.css')
        .pipe(cleanCss({
            keepSpecialComments: 0,
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest(themeTelepsyRoot + 'assets/css/')));

    streams = streams.concat(themeRoots.map(function(themeRoot) {
        var source = themeRoot + 'assets/css/colorscheme.css';

        return gulp.src(source)
            .pipe(cleanCss({
                keepSpecialComments: 0,
                compatibility: 'ie8'
            }))
            .pipe(gulp.dest(themeRoot + 'assets/css/'));
    }));

    return merge(streams);
});

gulp.task('watch:less', ['build:less'], function() {
    lessFiles.forEach(function(file) {
        watchLess(themeTelepsyRoot + 'compilers/less/' + file + '.less', {}, function() {
            compileLess(file)
                .pipe(notify({title: 'Less watcher', message: 'Recompiled ' + file, onLast: true}));
        }).on('error', notify.onError('Error compiling: ' + file + "\n" + '<%= error.message %>'));
    });

    var name = 'theme_telepsy';
    var themeRoot = themesRoot + name + '/';
    watchLess(themeRoot + 'compilers/less/colorscheme.less', {name: name}, function() {
        compileColorScheme(themeRoot)
            .pipe(notify({title: 'Less watcher', message: 'Recompiled theme ' + name}));
    }).on('error', notify.onError('Error compiling: ' + name + "\n" + '<%= error.message %>'));
});

themeJs.forEach(function (name) {
    gulp.task('js:' + name, function(){
        return gulp.src(themeTelepsyRoot + 'compilers/js/telepsy.' + name + '.js')
            .pipe(rename('telepsy.' + name + '.min.js'))
            .pipe(gulp.dest(themeTelepsyRoot + 'assets/js'));
    });
});

moduleJs.forEach(function (name) {
    gulp.task('js:' + name, function() {
        return gulp.src(moduleRoot + 'compilers/js/telepsy.' + name + '.js')
            .pipe(rename('telepsy.' + name + '.min.js'))
            .pipe(gulp.dest(moduleRoot + 'assets/js/'));
    });
});

gulp.task('build:js', themeJs.concat(moduleJs).map(function(name) { return 'js:' + name}));

gulp.task('minify:js', ['build:js'], function() {
    return merge(
        gulp.src(themeTelepsyRoot + 'assets/js/*.js')
            .pipe(uglify())
            .pipe(gulp.dest(themeTelepsyRoot + 'assets/js')
        ),
        gulp.src(moduleRoot + 'assets/js/*.js')
            .pipe(uglify())
            .pipe(gulp.dest(moduleRoot + 'assets/js')
        )
    );
});

gulp.task('watch:js', ['build:js'], function() {
    themeJs.forEach(function(name) {
        gulp.watch(themeTelepsyRoot + 'compilers/js/telepsy.' + name + '.js', ['js:' + name]);
    });
    moduleJs.forEach(function(name) {
        gulp.watch(moduleRoot + 'compilers/js/telepsy.' + name + '.js', ['js:' + name]);
    });
});
