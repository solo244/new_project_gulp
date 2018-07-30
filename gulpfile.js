// Load all plugins from the package.json file
var pkg = require("./package.json"),
    gulp = require("gulp"),
    gulpSequence = require("gulp-sequence"),
    critical = require("critical").stream,
    fs = require("fs"),
    ftp = require("vinyl-ftp"),
    path = require("path"),
    $ = require("gulp-load-plugins")({
      pattern: ["*"],
      scope: ["devDependencies"]
    }),
    image,
    onError = function(err) {
      $.notify.onError({
        title: "No: <%= error.plugin %> for you!",
        message: "On line: <%= error.line %> in file: <%= error.message %>",
        sound: "Pop",
        appIcon: image,
        icon: image,
        wait: true
      })(err);
    };

// Concat and uglify JS
gulp.task("js", function() {
  $.fancyLog("➜ Compiling JS");
  image = path.join(__dirname, pkg.paths.error + "js.png");
  return gulp.src(pkg.paths.assets.js_main + "*.js")
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.sourcemaps.init())
    .pipe($.concat(pkg.vars.js))
    .pipe($.uglify())
    .pipe($.sourcemaps.write("."))
    .pipe($.size({gzip: true, showFiles: false}))
    .pipe(gulp.dest(pkg.paths.build.js))
    .pipe($.browserSync.reload({ stream: true })
  );
});

gulp.task("vendors", function() {
  $.fancyLog("➜ Compiling JS vendors");
  image = path.join(__dirname, pkg.paths.error + "vendors.png");
  return gulp.src(pkg.paths.assets.js_vendors + "*.js")
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.concat(pkg.vars.vendors))
    .pipe($.uglify())
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(pkg.paths.build.js))
    .pipe($.browserSync.reload({ stream: true })
  );
});

// Provide fallback for jQuery
gulp.task('jquery', function() {
  $.fancyLog("➜ Providing jQuery fallback");
  console.log(pkg.paths.assets.js + "jquery-3.3.1.min.js");
  image = path.join(__dirname, pkg.paths.error + "vendors.png");
  return gulp.src(pkg.paths.assets.js + "jquery-3.3.1.min.js")
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.uglify())
    .pipe($.rename("jquery.min.js"))
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(pkg.paths.build.js))
    .pipe($.livereload()
  );
});

// SASS, autoprefix CSS & minify CSS
gulp.task("css", function() {
  $.fancyLog("➜ Compiling SCSS to CSS");
  image = path.join(__dirname, pkg.paths.error + "sass.png");
  return gulp.src(pkg.paths.assets.sass + pkg.vars.sass)
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      style: "compressed",
      errLogToConsole: false,
      onError: function(err) {
        return $.notify().write(err);
      }
    }))
    .pipe($.cached("sass_compile"))
    .pipe($.autoprefixer({browsers: ">0.25%"}))
    .pipe($.cssnano({
      discardComments: {
        removeAll: true
      },
      discardDuplicates: true,
      discardEmpty: true,
      minifyFontValues: true,
      minifySelectors: true
    }))
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe($.rename(pkg.vars.css))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(pkg.paths.build.css))
    .pipe($.livereload()
  );
});

// Compile Pug
gulp.task("pug", function(){
  $.fancyLog("➜ Compiling PUG to HTML");
  image = path.join(__dirname, pkg.paths.error + "pug.png");
  return gulp.src([pkg.paths.assets.pug + "**/*.pug", !pkg.paths.assets.pug + "_template/**/*.pug"])
    .pipe($.filter(function (file) {
        return !/\/_/.test(file.path) && !/^_/.test(file.relative);
    }))
    .pipe($.data(function (file) { return { require: require }; }))
    .pipe($.pug({ pretty: true, basedir: pkg.paths.assets.pug + "_layout" }))
    .pipe($.replace("min.css", "min.css?v=" + Date.now()))
    .pipe($.replace("min.js", "min.js?v=" + Date.now()))
    .pipe($.replace(".jpg", ".jpg?v=" + Date.now()))
    .pipe($.replace(".png", ".png?v=" + Date.now()))
    .pipe($.replace(".svg", ".svg?v=" + Date.now()))
    .pipe(gulp.dest(pkg.paths.build.main + ""))
    .pipe($.browserSync.reload({ stream: true })
  );
});

// Optimize images
gulp.task("images", function(){
  $.fancyLog("➜ Compiling IMAGES");
  image = path.join(__dirname, pkg.paths.error + "images.png");
  return gulp.src(pkg.paths.assets.images + "**/*.{png,jpg,jpeg,gif,svg,ico}")
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      optimizationLevel: 8,
      svgoPlugins: [{removeViewBox: false}],
      verbose: true,
      use: []
    })))
    .pipe(gulp.dest(pkg.paths.build.images)
  );
});

// Copy fonts
gulp.task("fonts", function(){
  image = path.join(__dirname, pkg.paths.error + "fonts.png");
  return gulp.src(pkg.paths.assets.main + "fonts/**/*")
    .pipe(gulp.dest(pkg.paths.build.css + "fonts")
  );
});

// Copy favicon
gulp.task("favicon", function(){
  image = path.join(__dirname, pkg.paths.error + "favicon.png");
  return gulp.src(pkg.paths.assets.main + "favicon/**/*")
    .pipe(gulp.dest(pkg.paths.build.main + "favicon")
  );
});

// Copy all files from build to dist folder
gulp.task("copy", function(){
  image = path.join(__dirname, pkg.paths.error + "copy.png");
  $.del.sync(pkg.paths.dist.main);
  return gulp.src(pkg.paths.build.main + "**")
    .pipe(gulp.dest(pkg.paths.dist.main)
  );
});

// Generate critical CSS & JS inline HTML
gulp.task("critical", ["copy"], function () {
  image = path.join(__dirname, pkg.paths.error + "critical.png");
  return gulp.src("dist/**/*.html")
    .pipe(critical({
      inline: true,
      base: "dist/",
      css: "dist/css/style.min.css",
      dimensions: [{
        width: 320,
        height: 480
      },{
        width: 768,
        height: 1024
      },{
        width: 1280,
        height: 960
      }],
      minify: true
    }))
    .pipe(gulp.dest("dist")
  );
});

// FTP
gulp.task("deploy", ["critical"], function() {
  image = path.join(__dirname, pkg.paths.error + "deploy.png");
  var cleanJSON = require("strip-json-comments"),
      globs = [pkg.paths.dist.main + "**"],
      config = fs.readFileSync(".ftppass", "utf8");

  config = JSON.parse(cleanJSON(config));

  var conn = ftp.create( {
    host:     config.kvd.server,
    user:     config.kvd.username,
    password: config.kvd.password
  });

  return gulp.src(globs, { base: pkg.paths.dist.main, buffer: false })
    .pipe(conn.newer(pkg.paths.dist.online_folder))
    .pipe(conn.dest(pkg.paths.dist.online_folder)
  );
});

// Clear dist folder after publish
gulp.task("delete", ["deploy"], function(){
  image = path.join(__dirname, pkg.paths.error + "delete.png");
  $.del.sync(pkg.paths.dist.main);
  return;
});

/**
 * Dev gulp tasks
 */

gulp.task("default", gulpSequence("vendors", "js", "jquery", "css", "pug", "favicon", "images", "fonts", "update"));

// Gulp watch task
gulp.task("update", function() {
  $.browserSync({ server: "./" + pkg.paths.build.main });
  gulp.watch([pkg.paths.assets.sass + "**/*.scss"], ["css"]);
  gulp.watch([pkg.paths.assets.js_vendors + "**/*.js"], ["vendors"]).on("change", $.browserSync.reload);
  gulp.watch([pkg.paths.assets.js_main + "**/*.js"], ["js"]).on("change", $.browserSync.reload);
  gulp.watch([pkg.paths.assets.images + "**/*"], ["images"]).on("change", $.browserSync.reload);
  gulp.watch([pkg.paths.assets.pug + "**/*"], ["pug"]).on("change", $.browserSync.reload);
});

/**
 * Deployment gulp task via ftp
 */

gulp.task("ftp", function (cb) {
  gulpSequence("vendors", "js", "jquery", "css", "pug", "images", "fonts", "delete")(cb);
});
