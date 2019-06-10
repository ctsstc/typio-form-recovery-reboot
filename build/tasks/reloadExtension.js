const gulp = require('gulp');
const os = require('os');
const exec = require('child_process').exec;

function reload_extension_task(cb) {
    if(os.platform() === 'win32') {
        exec('start chrome http://reload.extensions/ --new-window')
    } else {
        exec('open -a "Google Chrome" http://reload.extensions/');
    }
    cb();
}

exports.reload_extension_task = reload_extension_task;
