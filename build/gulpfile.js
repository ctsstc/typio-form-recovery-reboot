const { gulp, parallel, series, watch } = require('gulp')

const { sass_task } = require('./tasks/sass')
const { htmlmin_task } = require('./tasks/htmlmin')
const { copy_task } = require('./tasks/copy')
const { js_task } = require('./tasks/js')
const { reload_extension_task } = require('./tasks/reloadExtension')

exports.sass = sass_task
exports.htmlmin = htmlmin_task
exports.copy = copy_task
exports.js = series(js_task, reload_extension_task)
exports.reload = reload_extension_task



exports.build = parallel(js_task, copy_task, sass_task, htmlmin_task)
exports.default = watch_task
exports.watch = series(exports.build, watch_task)

function watch_task() {
    console.log("I'm watching you. Do something awesome.")

    watch(['../js/**/*.js', '../templates/**/*.vue', '!../publish/**/*.*'], series(js_task, reload_extension_task));
    watch('../sass/**/*.scss', sass_task);
    watch('../html/**/*.html', htmlmin_task);
    watch(['../img/**/*.png', '../fonts/**/*.*', '../manifest.json', '../license.txt'], copy_task);
}
