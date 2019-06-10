const gulp = require('gulp');

function copy_task(cb) {
    gulp.src('../fonts/**/*.*').pipe(gulp.dest('../publish/fonts'));
    gulp.src('../js/libs/**/*.*').pipe(gulp.dest('../publish/js'));
    gulp.src('../img/**/*.png').pipe(gulp.dest('../publish/img')); // Todo: Clean up images folder
    gulp.src(['../manifest.json', '../license.txt']).pipe(gulp.dest('../publish'));

    cb();
}

exports.copy_task = copy_task;
