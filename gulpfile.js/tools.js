
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
//***** 功能類 *****
//* gulp-clean 用於刪除檔案或目錄                                 
//--------------------------------------------
// gulp.task('clean', function () {
//     return gulp
//         .src(['./temp', './public'], {
//             read: false,
//             allowEmpty: true
//         })
//         .pipe($.clean());
// });

const clean = function (cb) {
    gulp
        .src(['./temp', './public'], {
            read: false,
            allowEmpty: true
        })
        .pipe($.clean());
    cb();
}

//* gulp-gh-pages 一鍵生成到Github pages                                
//--------------------------------------------
// gulp.task('ghPages', function () {
//     return gulp.src('./public/**/*')
//         .pipe($.ghPages({
//             baseDir: './public'
//         }));
// });

const ghPages = function (cb) {
    gulp.src('./public/**/*')
        .pipe($.ghPages({
            baseDir: './public'
        }));
    cb();
}

exports.clean=clean;
exports.ghPages=ghPages;