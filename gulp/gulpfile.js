var gulp = require("gulp");
var vinylPaths = require("vinyl-paths");
var uglify = require("gulp-uglify");
var combiner = require("stream-combiner2");
var del = require("del");
var browserSync = require("browser-sync");
var watch = require("gulp-watch");
var sass = require("gulp-ruby-sass");
var reload = browserSync.reload;

gulp.task("default", function() {
  gulp.src("./hello/*.{html,js}").pipe(gulp.dest("./hello/copy/"));
});
// gulp.watch("./hellow/index.html", function(event) {
//   console.log(event);
// });

//通过使用 stream-combiner2，你可以将一系列的 stream 合并成一个，这意味着，你只需要在你的代码中一个地方添加监听器监听 error 时间就可以了。
gulp.task("testCombiner2", function() {
  var combined = combiner.obj([
    gulp.src("./hello/index.js"),
    uglify(),
    gulp.dest("./hello/copy")
  ]);
  combined.on("error", console.error.bind(console));
  return combined;
});
//node del直接删除
gulp.task("delCopy", function() {
  del(["./hello/copy/*"]);
});
//在管道中将一些处理过的文件删除掉
gulp.task("delCopy2", function() {
  gulp
    .src("./hello/*.{html,js}")
    .pipe(gulp.dest("./hello/copy/"))
    .pipe(vinylPaths(del));
});

//热更新
gulp.task("hot", function() {
  browserSync({
    server: {
      baseDir: "./hot"
    }
  });
  watch(["./js/*.js", "./styles/*.scss", "./*.html"], { cwd: "hot" }, function(){
    sass("./hot/styles/*.scss").pipe(gulp.dest("./hot/styles"));
    reload();
  });
});
