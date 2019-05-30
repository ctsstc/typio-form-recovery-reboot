const gulp = require('gulp');
const sass = require('gulp-sass');

function sass_task(cb) {
    gulp.src('../sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('../publish/css'));
    cb();
}

exports.sass_task = sass_task
