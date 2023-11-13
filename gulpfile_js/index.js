const liveServer = require('gulp-live-server');
const minimist = require('minimist');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')(); //只能使用gulp相關套件
// const plumber = require('gulp-plumber');
const autoprefixer = require('autoprefixer');
// const postcss = require('gulp-postcss');
const sass = require('gulp-sass')(require('sass'));
// equal to:
//      const sass = require('gulp-sass');
//      const sassCompiler = require('sass');
//      sass(sassCompiler);
//* 模組化
const { clean,ghPages } =  require('./tools.js');

//***** 開發環境 *****
//* minimist 解析命令列參數以進行開發環境設定
//--------------------------------------------
// 1.定義了minimist選項
// 指定了參數 env為字串型態，預設值為 'develop'。
const envOptions = {
    string: 'env',
    default: { env: 'develop' }
}
//2.使用 minimist 模組，將命令列參數轉換為一個 JavaScript 物件。
//這個函數接受兩個參數，第一個是包含命令列參數的陣列，第二個是一個設定選項的物件
//在後續的程式碼中，你可以使用 options 物件來獲取命令列參數的值。
const options = minimist(process.argv.slice(2), envOptions)
// console.log(options)
//>> { _: [ 'jade' ], env: 'develop' }
// gulp jade --env production (預設是develop)
const isProduction = options.env === 'production';


//***** 功能類 *****
//* gulp-clean 用於刪除檔案或目錄                                 
//--------------------------------------------
gulp.task('clean',gulp.series(clean))

//* gulp-gh-pages 一鍵生成到Github pages                                
//--------------------------------------------
gulp.task('ghPages',gulp.series(ghPages))


//***** 任務類 *****
//* FIRST GULP-TASK                                
//--------------------------------------------
/** Gulp任務寫法:從source目錄複製html檔案到public目錄
 *
 * @task {copyHTML}
 * @description 將 HTML 檔案從來源目錄'./source/'複製到'./public/'。.
 * @function
 * @return {Stream} 表示任務執行的 Gulp流。
 */
// 使用.task('{name}',cb)指定任務名稱與內容
// 命令列輸入gulp+{name}就可以執行任務
gulp.task('copyHTML', () => {
    return gulp
        // 使用gulp.src('{path}')指定來源目錄
        .src('./source/**/*.html')
        // 使用.pipe(/*do sth...*/)指定事件
        // 使用.pipe(gulp.dest('{path}'))指定輸出目錄
        .pipe(gulp.dest('./public/'))
})
// 定義另一個任務，當發生更改時將被執行
gulp.task('anotherTask', () => {
    console.log('Files changed! Running another task...');
    // 在這裡添加你希望在發生更改時執行的操作
});

//* PUG                                
//--------------------------------------------
gulp.task('pug', async function () {
    await gulp.src('./source/**/*.pug')
        .pipe($.plumber())
        .pipe($.if(isProduction, $.pug({
            // options
            // 關閉pretty可以壓縮html格式
            pretty: false
        }), $.pug({
            pretty: true
        })))

        .pipe(gulp.dest('./public/'))
});

//* EJS                                
//--------------------------------------------
gulp.task('ejs', async function () {
    await gulp.src('./source/**/*.ejs')
        .pipe($.plumber())
        .pipe($.ejs({
            msg: "Hello Gulp!"
        }))
        .pipe($.rename({ extname: '.html' }))  
        .pipe(gulp.dest('./public/'));
});


//* SASS + POSTCSS + autoprefixer + Gulp-sourcemaps 
//--------------------------------------------
gulp.task('sass', async function () {
    await gulp.src('./source/scss/**/*.scss')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        //編譯完成CSS
        .pipe($.postcss([autoprefixer()])) // 直接引入 autoprefixer
        .pipe($.if(isProduction, $.cleanCss())) //壓縮CSS
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/css'))
});

//* Gulp-babel + Gulp-sourcemaps                  
//--------------------------------------------
gulp.task('babel', async () => {
    await gulp.src('./source/js/**/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['@babel/preset-env']
        }))
        .pipe($.concat('all.js'))
        //編譯完成JS
        .pipe($.if(isProduction, $.uglify({
            //選項:移除console
            compress: {
                drop_console: true
            }
        })))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js', { sourcemaps: '.' }));
});


//* GULP PLUMBER 防止錯誤中斷整個 Gulp 流程
//--------------------------------------------
// gulp.task('sass', function (done) {
//     return gulp.src('./source/**/*.scss')
//         .pipe(plumber()) //將.pipe(plumber())貼到每個src方法後方
//         ...
//         .on('end', done); 
// });


//***** 自動化流程類 *****
//** GULP4.0 
//parallel 用於同時執行 Gulp 任務
//series 用於依照順序執行 Gulp 任務
//--------------------------------------------
//*定義默認任務-開發環境中執行編譯  
gulp.task('default', 
    gulp.series(
        clean,
        function(done){
            gulp.parallel('ejs', 'sass', 'babel')();
            //live-server 開發伺服器
            const server = liveServer.static('./public', 8000);
            server.start(); 
            //GULP WATCH 監控檔案變更 
            gulp.watch('./source/**/*.pug', gulp.series('pug'))
            gulp.watch('./source/**/*.ejs', gulp.series('ejs'))
            gulp.watch('./source/scss/**/*.scss', gulp.series('sass'))
            gulp.watch('./source/js/**/*.js', gulp.series('babel'))            
            done();
        }
    ));
//--------------------------------------------
//*發佈用的流程 不需要加入watch和liveServer
//gulp build --env production
gulp.task('build', 
    gulp.series(
        clean,
        gulp.parallel('ejs', 'sass', 'babel'))
        );
gulp.task('deploy',gulp.series(ghPages));

