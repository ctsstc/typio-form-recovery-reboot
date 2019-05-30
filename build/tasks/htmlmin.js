const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');

function htmlmin_task(cb) {
    gulp.src('../html/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest('../publish/html'));
    cb();
}

exports.htmlmin_task = htmlmin_task;
