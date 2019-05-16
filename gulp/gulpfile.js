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

var browserSync = require("browser-sync").create();
// var connect = require("gulp-connect");

//在控制台显示错误
var handleError = function(err) {
  var colors = gutil.colors;
  console.log("\n");
  gutil.log(colors.red("Error!"));
  gutil.log("fileName: " + colors.red(err.fileName));
  gutil.log("lineNumber: " + colors.red(err.lineNumber));
  gutil.log("message: " + err.message);
  gutil.log("plugin: " + colors.yellow(err.plugin));
};

//监听js文件的
gulp.task("watchjs", function() {
  var watch = gulp.watch("src/js/**/*.js");
  watch.on("change", function(event) {
    const event1 = { type: "changed", path: event };
    //只处理变换的文件
    var paths = watchPath(event1, "src/", "dist/");
    gutil.log(gutil.colors.green(event1.type) + " " + paths.srcPath);
    gutil.log("Dist " + paths.distPath);
    //防止报错后终止代码执行
    var combined = combiner.obj([
      gulp.src(paths.srcPath),
      //形成map文件方便浏览器调试
      sourcemaps.init(),
      //压缩js文件
      uglify(),
      sourcemaps.write("./"),
      gulp.dest(paths.distDir),
      //热更新
      browserSync.stream()
    ]);
    combined.on("error", handleError);
  });
});
//监听css文件变化
gulp.task("watchcss", function() {
  var watch = gulp.watch("src/css/**/*.css");
  watch.on("change", function(event) {
    const event1 = { type: "changed", path: event };
    var paths = watchPath(event1, "src/", "dist/");
    gutil.log(gutil.colors.green(event1.type) + " " + paths.srcPath);
    gutil.log("Dist" + paths.distPath);
    var combined = combiner.obj([
      gulp.src(paths.srcPath),
      sourcemaps.init(),
      //添加浏览器前缀
      autoprefixer({ browsers: "last 2 versions" }),
      //压缩css文件
      minifycss(),
      sourcemaps.write("./"),
      gulp.dest(paths.distDir),
      browserSync.stream()
    ]);
    combined.on("error", handleError);
  });
});
//监听scss文件变化
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
      .pipe(gulp.dest(paths.distDir))
      .pipe(browserSync.stream());
  });
});
//监听图片变化
//由于watch.on回调函数的参数是unlink所以暂且替换所有图片，以后有解决方案后再修改
gulp.task("watchimage", function() {
  var watch = gulp.watch("src/images/**/*");
  watch.on("all", function() {
    gulp
      .src("src/images/**/*")
      .pipe(imagemin())
      .pipe(gulp.dest("dist/images/"));
  });
});
//监听index.html变化
gulp.task("watchIndex", function() {
  gulp.watch("index.html", function(done) {
    gulp.src("index.html").pipe(browserSync.stream());
    done();
  });
});

// gulp.task("connect", function() {
//   connect.server({
//     root: "./",
//     port: 1040,
//     livereload: true
//   });
// });

//启动本地服务，并在浏览器打开
gulp.task("server", function() {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    port: 1040
  });
});

gulp.task("default", gulp.parallel(["server", "watchIndex", "watchjs", "watchsass", "watchimage"]));
