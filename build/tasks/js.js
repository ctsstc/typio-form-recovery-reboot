const gulp = require('gulp');
const gutil = require('gulp-util');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const through2 = require('through2');
const vueCompiler = require('vue-template-compiler');
const vueEsCompiler = require('vue-template-es2015-compiler');
const asyncReplace = require('string-replace-async');
const plumber = require('gulp-plumber');
const stripDebug = require('gulp-strip-debug');


const filedata = {
    'options.js' : [

        // Modules
        '../js/modules/blacklist.js',
        '../js/modules/options/optionSanitizer.js',
        '../js/modules/options/defaultOptions.js',

        // Controllers
        '../js/controllers/optionsController.js',
    ],


    'popup.js' : [

        // Modules
        '../js/modules/blacklist.js',


        // Controllers
        '../js/controllers/popupController.js',
    ],


    'background.js' : [

        // Modules
        '../js/modules/blacklist.js',


        // Controllers
        '../js/controllers/background/backgroundController.js',
        '../js/controllers/background/maintenanceController.js',
        '../js/controllers/background/injectController.js',
        '../js/controllers/background/contextMenuController.js',
        '../js/controllers/background/splashController.js',
    ],

    // Runs isolated on every page (not in iframes)
    'content.js' : [

        // Classes
        '../js/classes/StorageBucket.js',
        '../js/classes/Editable.js',
        '../js/classes/EditableList.js',
        '../js/classes/Entry.js',
        '../js/classes/EntryList.js',
        '../js/classes/Session.js',
        '../js/classes/SessionList.js',

        // Modules
        '../js/modules/initHandler.js',
        '../js/modules/helpers.js',
        '../js/modules/options/optionSanitizer.js',
        '../js/modules/options/defaultOptions.js',
        '../js/modules/options/options.js',
        '../js/modules/db/db.js',
        '../js/modules/db/indexedDBDriver.js',
        '../js/modules/pathResolver.js',
        '../js/modules/pathGenerator.js',
        '../js/modules/editables.js',
        '../js/modules/defaults.js',
        '../js/modules/placeholders.js',
        '../js/modules/validator.js',
        '../js/modules/ui.js',
        '../js/modules/cache.js',
        '../js/modules/events.js',
        '../js/modules/keyboardShortcuts.js',
        '../js/modules/blacklist.js',

        // Controllers
        '../js/controllers/content/contentController.js',
        '../js/controllers/content/inputSaverController.js',
        '../js/controllers/content/focusedEditableController.js',
        '../js/controllers/content/saveIndicatorController.js',
        '../js/controllers/content/quickAccessIconController.js',
        '../js/controllers/content/quickAccessController.js',
        '../js/controllers/content/keyboardShortcutController.js',
        '../js/controllers/content/recoveryDialogController.js',
        '../js/controllers/content/toastController.js',
        '../js/controllers/content/blockController.js',
    ],

    // Runs on site context (not isolated)
    'content.frameInjector.js' : [
        '../js/modules/pathResolver.js',
        '../js/modules/pathGenerator.js',
        '../js/modules/cache.js',

        '../js/controllers/content.frameInjector/frameInjectorController.js',
        '../js/controllers/content.frameInjector/topOnlyController.js',
        '../js/controllers/content.frameInjector/childOnlyController.js',
    ]
};

function js_task(cb) {
    let promises = [];

    for(const targetName in filedata) {
        promises.push(new Promise((resolve) => {
            gulp.src(filedata[targetName])

                .pipe(plumber())

                .pipe(concat(targetName))

                // Compile and import vue templates inline
                .pipe(through2.obj((file, _, importCallback) => {
                    _vue_import(file, (newfile) => {
                        importCallback(null, newfile);
                        resolve();
                    })
                }))

                .pipe(gutil.env.production ? stripDebug() : gutil.noop())

                .pipe(gutil.env.production ? terser() : gutil.noop())

                .pipe(gulp.dest('../publish/js'))
        }));
    }

    Promise.all(promises).then(() => {
        cb();
    })
}


async function _vue_import(file, cb) {
    if (file.isBuffer()) {
        let text = await asyncReplace(String(file.contents), /'@import-vue (\w+)':0,/g, async function(match, name) {
            return await _get_template(name);
        });

        file.contents = Buffer.from(text);

        cb(file);
    } else {
        throw new Error('File not supported');
    }
}

async function _get_template(name) {
    return new Promise(function(resolve) {
        const path = '../templates/' + name + '.vue';
        gulp.src(path)
            .pipe(through2.obj(function(file) {
                let compiled = vueCompiler.compile(String(file.contents), {stripWith: true});
                let text = '';

                // Need to re-compile with vue-template-es-compiler to strip with() statements
                // because otherwise terser flips shit.
                // es-compiler needs valid js, so I need to prepend some stuff and strip it
                // out after to make it work. Not very pretty.

                text += vueEsCompiler('function render() {' + compiled.render + '}', {stripWith: true})
                    .replace(/^function render\(\)/, 'render()');
                text += ',';

                if(compiled.staticRenderFns.length) {
                    text += "\n";
                    text += 'staticRenderFns: [';

                    let funcs = [];
                    for(const renderFn of compiled.staticRenderFns) {
                        funcs.push(
                            vueEsCompiler('var x = function() {' + renderFn + '}')
                            .replace(/^var x = function/, 'function')
                        );
                    }

                    text += funcs.join(',');
                    text += '],';
                }

                resolve(text);
            }));
    });
}

exports.js_task = js_task;
