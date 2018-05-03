module.exports = function(grunt) {
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        htmlmin: {
            html: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    src: ['../html/**/*.html'],
                    dest: '../publish/html'
                }]
            },
        },

        copy: {
            jslibs: {
                files: [{
                    expand: true,
                    cwd: '../js/libs/',
                    src: '*.js',
                    dest: '../publish/js/'
                }]
            },
            fonts: {
                files: [{
                    expand: true,
                    cwd: '../',
                    src: 'fonts/**/*.*',
                    dest: '../publish/'
                }]
            },
            img: {
                files: [{
                    expand: true,
                    src: [
                        '../img/icon16.png',
                        '../img/icon38.png',
                        '../img/icon48.png',
                        '../img/icon128.png'
                    ],
                    dest: '../publish/img'
                }],
            },
            templates: {
                files: [{
                    expand: true,
                    cwd: '../',
                    src: 'templates/*.*',
                    dest: '../publish/'
                },
                {
                    expand: true,
                    cwd: '../templates/',
                    src: ['**/render.js'],
                    rename: function(src, dest) {
                        return '../publish/templates/' + dest.replace(/(.+)\/(.+)/g, '$1.js')
                    }
                }]
            },
            misc: {
                files: [{
                    expand: true,
                    cwd: '../',
                    src: ['manifest.json', 'license.txt'],
                    dest: '../publish'
                }]
            }
        },

        uglify: {
            options: {
                mangle: false,
                preserveComments: true,
                beautify: true,
                verbose: true,
                sourceMap: true,
                // mangle: true,
                // preserveComments: false,
                // beautify: false,
                // verbose: false,
                // sourceMap: false,
            },
            content: {
                files: {

                    '../publish/js/options.js' : [

                        // Modules
                        '../js/modules/blacklist.js',
                        '../js/modules/options/optionSanitizer.js',
                        '../js/modules/options/defaultOptions.js',

                        // Controllers
                        '../js/controllers/optionsController.js',
                    ],

                    '../publish/js/options2.js' : [

                        // Controllers
                        '../js/controllers/options2Controller.js',
                    ],


                    '../publish/js/popup.js' : [

                        // Modules
                        '../js/modules/blacklist.js',


                        // Controllers
                        '../js/controllers/popupController.js',
                    ],


                    '../publish/js/background.js' : [

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
                    '../publish/js/content.js' : [

                        // Classes
                        '../js/classes/StorageBucket.js',
                        '../js/classes/Editable.js',
                        '../js/classes/EntryList.js',
                        '../js/classes/Entry.js',
                        '../js/classes/SessionList.js',
                        '../js/classes/Session.js',

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
                        '../js/modules/validator.js',
                        '../js/modules/ui.js',
                        '../js/modules/quickAccess.js',
                        '../js/modules/saveIndicator.js',
                        '../js/modules/cache.js',
                        '../js/modules/events.js',
                        '../js/modules/keyboardShortcuts.js',
                        '../js/modules/toast.js',
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
                    ],

                    // Runs on site context (not isolated)
                    '../publish/js/content.frameInjector.js' : [
                        '../js/modules/pathResolver.js',
                        '../js/modules/pathGenerator.js',
                        '../js/modules/cache.js',

                        '../js/controllers/content.frameInjector/frameInjectorController.js',
                            '../js/controllers/content.frameInjector/topOnlyController.js',
                            '../js/controllers/content.frameInjector/childOnlyController.js',
                    ],

                    '../publish/js/content.blacklisted.js' : [
                        '../js/modules/blacklist.js',
                        '../js/controllers/content.blacklisted/blacklistedController.js',
                    ]
                }
            }
        },

        sass: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '../scss',
                    src: '*.scss',
                    dest: '../publish/css/',
                    ext: '.css'
                }]
            }
        },

        watch: {
            scss: {
                files: ['../scss/**/*.scss'],
                tasks: ['sass'],
                options: {
                    spawn: false
                }
            },

            js: {
                files: ['../js/**/*.js'],
                tasks: ['uglify:content'],
                options: {
                    spawn: false
                }
            },

            html: {
                files: ['../html/**/*.html'],
                tasks: ['htmlmin'],
                options: {
                    spawn: false
                }
            },

            copyFonts: {
                files: ['../fonts/**/*.*'],
                tasks: ['copy:fonts'],
                options: {
                    spawn: false
                }
            },

            copyIMG: {
                files: ['../img/**/*.*'],
                tasks: ['copy:img'],
                options: {
                    spawn: false
                }
            },

            copyMisc: {
                files: ['../manifest.json', '../license.txt'],
                tasks: ['copy:misc'],
                options: {
                    spawn: false
                }
            },

            copyTemplates: {
                files: ['../templates/**/*.*'],
                tasks: ['vue_template_compiler', 'copy:templates'],
                options: {
                    spawn: false
                }
            }
        },

        vue_template_compiler: {
            options: {
                validate: true, //default is true
                validateOnly: false, //default is false
                es2015: true //default is true
            },
            opts: { files : {src:'../templates/options/options.vue'} },
            dialog: { files : {src:'../templates/dialog/dialog.vue'} },
            keyboardShortcutPopup: { files : {src:'../templates/keyboardShortcutPopup/keyboardShortcutPopup.vue'} },
        },

    });


    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-vue-template-compiler');

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('compile', ['sass', 'uglify', 'htmlmin', 'vue_template_compiler', 'copy']);

}