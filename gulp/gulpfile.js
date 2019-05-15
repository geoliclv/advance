var gulp = require("gulp");
var gutil = require("gulp-util");
var uglify = require("gulp-uglify");
var watchPath = require("gulp-watch-path");
var combiner = require("stream-combiner2");
var sourcemaps = require("gulp-sourcemaps");
var minifycss = require("gulp-minify-css");
var autoprefixer = require("gulp-autoprefixer");
var sass = require("gulp-ruby-sass");

var imagemin = require("gulp-imagemin");

var connect = require("gulp-connect");

var handleError = function(err) {
  var colors = gutil.colors;
  console.log("\n");
  gutil.log(colors.red("Error!"));
  gutil.log("fileName: " + colors.red(err.fileName));
  gutil.log("lineNumber: " + colors.red(err.lineNumber));
  gutil.log("message: " + err.message);
  gutil.log("plugin: " + colors.yellow(err.plugin));
};

gulp.task("watchjs", function() {
  var watch = gulp.watch("src/js/**/*.js");
  watch.on("change", function(event) {
    const event1 = { type: "changed", path: event };
    var paths = watchPath(event1, "src/", "dist/");
    gutil.log(gutil.colors.green(event1.type) + " " + paths.srcPath);
    gutil.log("Dist " + paths.distPath);

    var combined = combiner.obj([gulp.src(paths.srcPath), sourcemaps.init(), uglify(), sourcemaps.write("./"), gulp.dest(paths.distDir),connect.reload()]);
    combined.on("error", handleError);
  });
});

gulp.task("watchcss", function() {
  var watch = gulp.watch("src/css/**/*.css");
  watch.on("change", function(event) {
    const event1 = { type: "changed", path: event };
    var paths = watchPath(event1, "src/", "dist/");
    gutil.log(gutil.colors.green(event1.type) + " " + paths.srcPath);
    gutil.log("Dist" + paths.distPath);
    var combined = combiner.obj([gulp.src(paths.srcPath), sourcemaps.init(), autoprefixer({ browsers: "last 2 versions" }), minifycss(), sourcemaps.write("./"), gulp.dest(paths.distDir),connect.reload()]);
    combined.on("error", handleError);
  });
});

gulp.task("watchsass", function() {
  var watch = gulp.watch("src/sass/**/*.scss");
  watch.on("change", function(event) {
    const event1 = { type: "changed", path: event };
    var paths = watchPath(event1, "src/sass/", "dist/css/");
    gutil.log(gutil.colors.green(event1.type) + " " + paths.srcPath);
    gutil.log("Dist" + paths.distPath);
    sass(paths.srcPath)
      .on("error", function(err) {
        console.error(err.message);
      })
      .pipe(sourcemaps.init())
      .pipe(minifycss())
      .pipe(
        autoprefixer({
          browsers: "last 2 versions"
        })
      )
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest(paths.distDir)).pipe(connect.reload());
  });
});

gulp.task("watchimage", function() {
  var watch = gulp.watch("src/images/**/*");
  watch.on("all", function() {
    gulp
      .src("src/images/**/*")
      .pipe(imagemin())
      .pipe(gulp.dest("dist/images/"));
  });
});

gulp.task("connect", function() {
  connect.server({
    root: "./",
    port:1040,
    livereload: true
  });
});

gulp.task("default", gulp.parallel(['connect',"watchjs", "watchsass", "watchimage"]));
