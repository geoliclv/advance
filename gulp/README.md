# Gulp
---

>version 4.0.2

gulp借助于node的服务端能力，拥有了前端工程化的能力，正如它所标榜的一样`The streaming build system`，是一个流式构建系统。与其他构建工具不同，gulp是通过task，即组织任务来进行工程化构建。


## 安装

```shell
$ npm install --save-dev gulp
```

## gulpfile

gulp的执行是基于根部目录下的`gulpfile.js`文件，所以没有这个文件需要新建一个

```js
function defaultTask(cb) {
    //some code
  cb();
}

exports.default = defaultTask
```
这样在命令行输入gulp就会默认执行`default`任务

```bash
$ gulp
```

## Task

gulp是根据一个一个task来执行任务的，由于使用的是`gulp4`，所以写法跟之前写task不同，现在是用函数的写法来写task

```js
//before
const gulp = reqiure('gulp');

gulp.task('task1',function(){
    //some code
})
//now
function task1(cb){
    //some code
    cb();
}

//注意需要输出
exports.task1 = task1
```

`gulp4`的一个新概念就是`私有task`和`公有task`,而私有task的实现是依靠新增的`series`和`parallel`来实现的

首先来说新增的`series`和`parallel`

两者的使用方法都是把task当作参数传到函数中，而且可以嵌套。

不同的是，`series`是串行进行也就是按照参数task的顺序进行，前一个task执行完才能执行下一个task(格外注意结束方式)。而`parallel`是并行的执行

```js
const {series,parallel} = require('gulp');

function task1(cb){
    //some code
    cb();
}

function task2(cb){
    //some code
    cb();
}

//series是串行
exports.default = series(task1,task2);

//parallel是并行
exports.default = parallel(task1,task2);

//也可以进行嵌套 

exports.default = series(task1,parallel(task1,task2))

exports.default = parallel(task1,series(task1,task2))
```

其实`私有task`和`公有task`到这里就不难理解了，即没有直接输出的，而是通过`series`,`parallel`间接输出，无法在命令行上直接执行的task叫做私有task，而公有task就是可以在命令行上直接执行的

## 结束方式

上面有提到结束方式这个概念，需要采用结束方式来结束任务是因为task执行完后，gulp并不能知道这个task已经结束，这时候需要我们手动去结束任务。如果没有手动结束，那么就会出现问题。比如`series`无法执行下一个task，又比如`gulp.watch`监听只触发一次。

那么结束方式有哪些呢，这里直接抄袭[gulp官网](https://gulpjs.com/docs/en/getting-started/async-completion)了

1. Returning a stream(返回文件流)
    ```js
    const { src, dest } = require('gulp');

    function streamTask() {
    return src('*.js')
        .pipe(dest('output'));
    }

    exports.default = streamTask;

    ```
1. Returning a promise(返回一个Promise)
    ```js
    function promiseTask() {
    return Promise.resolve('the value is ignored');
    }

    exports.default = promiseTask;

    ```
1. Returning an event emitter(返回一个事件触发器)
    ```js
    const { EventEmitter } = require('events');

    function eventEmitterTask() {
    const emitter = new EventEmitter();
    // Emit has to happen async otherwise gulp isn't listening yet
    setTimeout(() => emitter.emit('finish'), 250);
    return emitter;
    }

    exports.default = eventEmitterTask;
    ```
1. Returning a child process(返回子进程)
    ```js
    const { Observable } = require('rxjs');

    function observableTask() {
    return Observable.of(1, 2, 3);
    }

    exports.default = observableTask;
    ```
1. Using an error-first callback(使用回调函数)
    ```js
    function callbackTask(cb) {
    // `cb()` should be called by some async work
    cb();
    }

    exports.default = callbackTask;
    
    //顾名思义，也可以返回一个Error实例
    function callbackError(cb) {
    // `cb()` should be called by some async work
    cb(new Error('kaboom'));
    }

    exports.default = callbackError;
    ```
1. Using async/await(使用同步函数)
    ```js
    const fs = require('fs');

    async function asyncAwaitTask() {
    const { version } = fs.readFileSync('package.json');
    console.log(version);
    await Promise.resolve('some result');
    }

    exports.default = asyncAwaitTask;
    ```

## 操作文件

gulp操作文件是通过它提供的`src`和`dest`方法来实现的。`src`负责读，`dest`负责写，通过pipe管道来传递文件流，在`pipe`中可以对文件流执行一下操作。

`src`和`dest`接受的路径均为[glob](https://github.com/isaacs/node-glob)形式，`src`可以接受一个[glob](https://github.com/isaacs/node-glob)组成的数组

```js
const { src, dest } = require('gulp');
const babel = require('gulp-babel');

exports.default = function() {
  return src('src/*.js')
    .pipe(babel())
    .pipe(dest('output/'));
}
```

## 监听

现在前端工程化基本都会有两个目录。一个是开发代码(src)，一个是打包后的代码(dist)。对于前端开发者，希望的是改变一段代码后能够立即生效，提高工作效率。那么就要用到gulp的监听功能，把src下的文件打包或者编译后放到dist目录，然后使浏览器刷新，能够立马看到效果。

监听用的是gulp的`watch`方法，有两种使用方式

1. 使用回调函数
    ```js
    const { watch } = require('gulp');

    watch(['input/*.js', '!input/something.js'], function(cb) {
    // body omitted
    cb();
    });
    ```
1. 使用事件绑定
    ```js
    const { watch } = require('gulp');

    const watcher = watch("src/sass/**/*.scss");
    watcher.on("all", function(stats, path) {
        //stats为触发的事件，path是被改变的文件路径

        //some code
    })
    ```
    这里使用了all事件，其它事件还有`add`, `addDir`, `change`, `unlink`, `unlinkDir`, `ready`, `error`
    >这里需要注意的是这些事件的回调函数的参数可能不一样，需要注意

## 热更新

上面有说到浏览器自动刷新，其实这就是个热更新的功能，对此推荐使用插件`browser-sync`并结合gulp的`watch`方法来实现，我自己写了个[例子](https://github.com/sparklwb/advance/tree/master/gulp)可以参考一下
