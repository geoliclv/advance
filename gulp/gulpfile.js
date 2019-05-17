const { src, dest, series, parallel, watch } = require("gulp");
const clean = require("gulp-clean");
const gutil = require("gulp-util");
const uglify = require("gulp-uglify");
const watchPath = require("gulp-watch-path");
const combiner = require("stream-combiner2");
const sourcemaps = require("gulp-sourcemaps");
const minifycss = require("gulp-minify-css");
const autoprefixer = require("gulp-autoprefixer");
const sass = require("gulp-ruby-sass");

const imagemin = require("gulp-imagemin");

const browserSync = require("browser-sync").create();
// const connect = require("gulp-connect");

//在控制台显示错误
const handleError = function(err) {
  const colors = gutil.colors;
  console.log("\n");
  gutil.log(colors.red("Error!"));
  gutil.log("fileName: " + colors.red(err.fileName));
  gutil.log("lineNumber: " + colors.red(err.lineNumber));
  gutil.log("message: " + err.message);
  gutil.log("plugin: " + colors.yellow(err.plugin));
};

//监听js文件变化
function watchjs(cb) {
  const watcher = watch("src/js/**/*.js");
  watcher.on("all", function(stats, path) {
    const event = { type: stats, path };
    //只处理变换的文件
    const paths = watchPath(event, "src/", "dist/");
    gutil.log(gutil.colors.green(event.type) + " " + paths.srcPath);
    gutil.log("Dist " + paths.distPath);
    //防止报错后终止代码执行
    const combined = combiner.obj([
      src(paths.srcPath),
      //形成map文件方便浏览器调试
      sourcemaps.init(),
      //压缩js文件
      uglify(),
      sourcemaps.write("./"),
      dest(paths.distDir),
      //热更新
      browserSync.stream()
    ]);
    combined.on("error", handleError);
  });
  cb();
}
//监听css文件变化
function watchcss(cb) {
  const watcher = watch("src/css/**/*.css");
  watcher.on("all", function(stats, path) {
    const event = { type: stats, path };
    const paths = watchPath(event, "src/", "dist/");
    gutil.log(gutil.colors.green(event.type) + " " + paths.srcPath);
    gutil.log("Dist" + paths.distPath);
    const combined = combiner.obj([
      src(paths.srcPath),
      sourcemaps.init(),
      //添加浏览器前缀
      autoprefixer({ browsers: "last 2 versions" }),
      //压缩css文件
      minifycss(),
      sourcemaps.write("./"),
      dest(paths.distDir),
      browserSync.stream()
    ]);
    combined.on("error", handleError);
  });
  cb();
}
//监听scss文件变化
function watchsass(cb) {
  const watcher = watch("src/sass/**/*.scss");
  watcher.on("all", function(stats, path) {
    const event = { type: stats, path };
    const paths = watchPath(event, "src/sass", "dist/css");
    gutil.log(gutil.colors.green(event.type) + " " + paths.srcPath);
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
      .pipe(dest(paths.distDir))
      .pipe(browserSync.stream());
  });
  cb();
}
//监听图片变化
function watchimage(cb) {
  const watcher = watch("src/images/**/*");
  watcher.on("all", function(stats, path) {
    const event = { type: stats, path };
    const paths = watchPath(event, "src/", "dist/");
    if (event.type !== "unlink") {
      gutil.log(gutil.colors.green(event.type) + " " + paths.srcPath);
      gutil.log("Dist" + paths.distPath);
      const combined = combiner.obj([
        src(paths.srcPath),
        //压缩图片
        imagemin(),
        dest(paths.distDir),
        browserSync.stream()
      ]);
      combined.on("error", handleError);
    } else {
      const combined = combiner.obj([
        src(paths.distPath),
        //压缩图片
        clean(),
        browserSync.stream()
      ]);
      combined.on("error", handleError);
    }
  });
  cb();
}
//监听index.html变化
function watchIndex(cb) {
  const watcher = watch("index.html");
  watcher.on("all", function(stats, path) {
    gutil.log(gutil.colors.green(stats) + " " + path);
    src("index.html").pipe(browserSync.stream());
  });
  cb();
}

// gulp.task("connect", function() {
//   connect.server({
//     root: "./",
//     port: 1040,
//     livereload: true
//   });
// });

//启动本地服务，并在浏览器打开

function server(cb) {
  browserSync.init({
    server: {
      baseDir: "./"
    },
    port: 1040
  });
  cb();
}

exports.default = parallel([server, watchIndex, watchjs, watchsass, watchimage]);
