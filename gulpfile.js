/* --- Default vars and load in all plugins from package--- */
const pkg = require("./package.json");
const gulp = require("gulp");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const $ = require("gulp-load-plugins")({
  pattern: ["*"],
  scope: ["devDependencies"]
});

/* --- All JS scripts --- */
function script() {
  $.fancyLog("➜ Compiling all JS stuff");

  return (
    $.browserify({
      entries: [pkg.paths.assets.js + "main.js"],
      debug: true,
      paths: ["./node_modules"]
    })
      .transform($.babelify.configure({ presets: ["@babel/env"] }))
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(buffer())
      .pipe($.uglify())
      .pipe($.rename(pkg.vars.js))
      .pipe(gulp.dest(pkg.paths.build.js))
  );
}

/* --- All SCSS styles --- */
function style() {
  $.fancyLog("➜ Compiling SCSS into CSS");

  return (
    gulp
      .src(pkg.paths.assets.sass + pkg.vars.sass)
      .pipe($.sourcemaps.init())
      .pipe($.sass({
        style: "compressed",
        errLogToConsole: false,
        onError: function (err) {
          return $.notify().write(err);
        }
      }))
      .on("error", $.sass.logError)
      .pipe($.postcss([
        $.cssnano({
          discardComments: {
            removeAll: true
          },
          discardDuplicates: true,
          discardEmpty: true,
          minifyFontValues: true,
          minifySelectors: true
        })
      ]))
      .pipe($.sourcemaps.write())
      .pipe($.rename(pkg.vars.css))
      .pipe(gulp.dest(pkg.paths.build.css))
      .pipe($.browserSync.stream())
  );
}

/* --- Compile pug files --- */
function pug() {
  $.fancyLog("➜ Compiling Pug files to HTML");

  return (
    gulp
      .src([pkg.paths.assets.pug + "**/*.pug", !pkg.paths.assets.pug + "_layout/**/*.pug"])
      .pipe($.filter(function (file) {
        return !/\/_/.test(file.path) && !/^_/.test(file.relative);
      }))
      .pipe($.data(function () { return { require: require }; }))
      .pipe($.pug({ pretty: true, basedir: pkg.paths.assets.pug + "_layout" }))
      .pipe(gulp.dest(pkg.paths.build.main + ""))
      .pipe($.replace("min.css", "min.css?v=" + Date.now()))
      .pipe($.replace("min.js", "min.js?v=" + Date.now()))
      .pipe($.replace(".jpg", ".jpg?v=" + Date.now()))
      .pipe($.replace(".png", ".png?v=" + Date.now()))
      .pipe($.replace(".svg", ".svg?v=" + Date.now()))
  );
}

/* --- Copy and optimize all images --- */
function images() {
  $.fancyLog("➜ Copy and optimize all images");

  return (
    gulp
      .src(pkg.paths.assets.images + "**/*.{png,jpg,jpeg,gif,svg,ico}")
      .pipe($.imagemin({
        progressive: true,
        interlaced: true,
        optimizationLevel: 8,
        svgoPlugins: [{ removeViewBox: false }],
        verbose: true,
        use: []
      }))
      .pipe(gulp.dest(pkg.paths.build.images))
  );
}

/* --- Copy over favicons --- */
function favicon() {
  $.fancyLog("➜ Copy over favicons");

  return (
    gulp
      .src(pkg.paths.assets.main + "favicon/**/*")
      .pipe(gulp.dest(pkg.paths.build.main + "favicon"))
  );
}

/* --- Copy over any custom fonts --- */
function font() {
  $.fancyLog("➜ Copy over any custom fonts");

  return (
    gulp
      .src(pkg.paths.assets.main + "fonts/**/*")
      .pipe(gulp.dest(pkg.paths.build.css + "fonts"))
  );
}

/* --- Empty build directory --- */
function cleanupBuild() {
  return $.del([pkg.paths.build.main]);
}

/* --- Empty dist directory --- */
function cleanupDist() {
  return $.del([pkg.paths.dist.main]);
}

/* --- Copy over to dist --- */
function dist () {
  $.fancyLog("➜ Copy over to dist");

  return (
    gulp
      .src(pkg.paths.build.main + "**")
      .pipe(gulp.dest(pkg.paths.dist.main))
  );
}

/* --- Replace assets links to live url --- */
function replace() {
  $.fancyLog("➜ Replace assets links to live url");

  return (
    gulp
      .src([pkg.paths.dist.main + "**/*.html"])
      /*eslint-disable */
      .pipe($.replace(/src="\//g, 'src="/' + pkg.paths.dist.online_folder))
      .pipe($.replace(/href="\//g, 'href="/' + pkg.paths.dist.online_folder))
      /*eslint-enable */
      .pipe(gulp.dest(pkg.paths.dist.main + ""))
  );
}

/* --- Set default watch task --- */
function watch() {
  $.browserSync.init({
    server: {
      baseDir: "./" + pkg.paths.build.main
    }
  });

  gulp.watch(pkg.paths.assets.js + "**/*.js", gulp.series(script));
  gulp.watch(pkg.paths.assets.sass + "**/*.scss", style);
  gulp.watch(pkg.paths.assets.pug + "**/*.pug", gulp.series(pug));
  gulp.watch(pkg.paths.assets.images + "**/*", gulp.series(images));
}

/* --- Export command to run with gulp in command line --- */
exports.script = script;
exports.style = style;
exports.pug = pug;
exports.images = images;
exports.replace = replace;
exports.dist = dist;

/* --- Export general dev - build and watch command --- */
exports.default = gulp.series(cleanupBuild, script, style, pug, images, favicon, font);
exports.watch = gulp.series(cleanupBuild, script, style, pug, images, favicon, font, watch);

/* --- Set full deploy via Netlify --- */
exports.publish = gulp.series(cleanupBuild, script, style, pug, images, favicon, font, cleanupDist, dist, replace);
