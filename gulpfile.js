const path = require('path');
const chalk = require('chalk');
const gulp = require('gulp');
const less = require('gulp-less');
const changed = require('gulp-changed');
const rename = require('gulp-rename');
//const gulp_babel = require('gulp-babel');
const rollup = require('gulp-rollup');
const rollup_babel = require('rollup-plugin-babel');

const buildBundle = require('./tools/gulp-plugin-build-bundle');//自定义处理bundle

gulp.task('less-task', lessTask); //编译样式文件
gulp.task('rollup-task', rollupTask);  //编译js模块
gulp.task('copy-file-task', copyFileTask); //拷贝文件
//gulp.task('babel-task', babelTask); //babel转码
gulp.task('default', ['less-task', 'copy-file-task', 'rollup-task']);

function lessTask(done) {
    gulp.src(['./src/**/*/*.less', './src/*.less'])
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(rename((path) => {
            path.extname = '.wxss';
        }))
        .pipe(gulp.dest('./dist'))
        .on('finish', () => { });
}

function copyFileTask(done) {
    gulp.src([
        'src/*.json',
        'src/**/*/*.json',
        'src/**/*/*.wxml',
        'src/**/*/*.wxs',
        'src/*.js',
    ])
        .pipe(changed('./dist'))
        .pipe(gulp.dest('./dist'))
        .on('finish', done);
}

function rollupTask(done) {
    gulp.src([
        'src/*.js',
        'src/**/*/*.js',
        'tools/base.js'
    ])
        .pipe(rollup({
            input: ['src/index.js'],
            plugins: [ //转义
                rollup_babel({
                    babelrc: false,
                    presets: [
                        "react",
                        ["env", {
                            "loose": true,
                            "modules": false
                        }]
                    ],
                    plugins: ["transform-class-properties", "transform-class-properties"]
                })
            ],
            onwarn(warning) { //异常处理
                if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
                if (warning.code === 'UNRESOLVED_IMPORT') { console.log('有不能正确解析的模块'); return };
                if (warning.code === 'NON_EXISTENT_EXPORT') throw new Error(warning.message);
                console.warn(warning.message);
            }
        }))
        .on('bundle', buildBundle)
        .on('error', err => console.error(err.stack || err))
        .pipe(changed('./dist'))
        // .pipe(gulp.dest('./dist'))
        .on('finish', done);
}

/* function babelTask(done) {
    gulp.src([
        'src/index.js'
    ])
        .pipe(gulp_babel({
            "presets": ["react", "env"],
            "plugins": ["transform-class-properties", "transform-class-properties"]
        }))
        .on('error', err => console.error(err.stack || err))
        .pipe(changed('./dist'))
        .pipe(gulp.dest('./dist'))
        .on('finish', done);
} */