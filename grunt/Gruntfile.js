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
                        '../img/icon128.png',
                        '../img/qa-icon.png',
                    ],
                    dest: '../publish/img'
                }],
            },
            // templates: {
            //     files: [{
            //         expand: true,
            //         cwd: '../',
            //         src: 'templates/*.*',
            //         dest: '../publish/'
            //     },
            //     {
            //         expand: true,
            //         cwd: '../templates/',
            //         src: ['**/render.js'],
            //         rename: function(src, dest) {
            //             return '../publish/templates/' + dest.replace(/(.+)\/(.+)/g, '$1.js')
            //         }
            //     }]
            // },
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
                // compress:{
                //     pure_funcs: ['console.log', 'console.time', 'console.timeEnd']
                // }
            },
            content: {
                files: {
                    /*'../publish/js/dbManagerController.js' : [

                        // Classes
                        '../js/classes/StorageBucket.js',
                        '../js/classes/Editable.js',
                        '../js/classes/EditableList.js',
                        '../js/classes/Entry.js',
                        '../js/classes/EntryList.js',
                        '../js/classes/Session.js',
                        '../js/classes/SessionList.js',

                        // Modules
                        '../js/modules/helpers.js',

                        // Controllers
                        '../js/controllers/options/tmp/dbManagerController.js',

                    ],*/
                    '../publish/js/options.js' : [

                        // Modules
                        '../js/modules/blacklist.js',
                        '../js/modules/options/optionSanitizer.js',
                        '../js/modules/options/defaultOptions.js',

                        // Controllers
                        '../js/controllers/options/tmp/optionsController.js',
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
                        '../js/controllers/background/dbStatsController.js',
                        '../js/controllers/background/injectController.js',
                        '../js/controllers/background/contextMenuController.js',
                        '../js/controllers/background/splashController.js',
                    ],

                    // Runs isolated on every page (not in iframes)
                    '../publish/js/content.js' : [

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
                        '../js/controllers/content/tmp/contentController.js',
                            '../js/controllers/content/tmp/inputSaverController.js',
                            '../js/controllers/content/tmp/focusedEditableController.js',
                            '../js/controllers/content/tmp/saveIndicatorController.js',
                            '../js/controllers/content/tmp/quickAccessIconController.js',
                            '../js/controllers/content/tmp/quickAccessController.js',
                            '../js/controllers/content/tmp/keyboardShortcutController.js',
                            '../js/controllers/content/tmp/recoveryDialogController.js',
                            '../js/controllers/content/tmp/toastController.js',
                            '../js/controllers/content/tmp/blockController.js',
                    ],

                    // Runs on site context (not isolated)
                    '../publish/js/content.frameInjector.js' : [
                        '../js/modules/pathResolver.js',
                        '../js/modules/pathGenerator.js',
                        '../js/modules/cache.js',

                        '../js/controllers/content.frameInjector/frameInjectorController.js',
                            '../js/controllers/content.frameInjector/topOnlyController.js',
                            '../js/controllers/content.frameInjector/childOnlyController.js',
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
                tasks: ['string-replace', 'uglify:content', 'exec:reloadExtension'],
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
                files: ['../templates/**/*.vue'],
                tasks: ['vue_template_compiler', 'string-replace', 'uglify', 'exec:reloadExtension'],
                options: {
                    spawn: false
                }
            }
        },

        exec: {
          reloadExtension: 'start chrome http://reload.extensions/ --new-window'
        },

        vue_template_compiler: {
            options: {
                validate: true,
                validateOnly: false,
                es2015: true
            },
            dialog: { files : {src:'../templates/content/dialog.vue'} },
            keyboardShortcutPopup: { files : {src:'../templates/content/keyboardShortcutPopup.vue'} },
            saveIndicator: { files : {src:'../templates/content/saveIndicator.vue'} },
            toast: { files : {src:'../templates/content/toast.vue'} },
            quickAccess: { files : {src:'../templates/content/quickAccess.vue'} },
            quickAccessListItem: { files : {src:'../templates/content/quickAccessListItem.vue'} },

            dbMan: { files : {src:'../templates/options/db-man.vue'} },
            dbManager: { files : {src:'../templates/options/db-manager.vue'} },
        },

        'string-replace': {
            inline: {
                files: [{
                    expand: true,
                    cwd: '../js/controllers/content/',
                    src: ['*.js'],
                    dest: '../js/controllers/content/tmp/'
                },{
                    expand: true,
                    cwd: '../js/controllers/options/',
                    src: ['*.js'],
                    dest: '../js/controllers/options/tmp/'
                }],
                options: {
                    replacements: [
                        { pattern: /'@import-vue (.*?)':0/, replacement: vueStringReplaceFn },
                        { pattern: /'@import-vue (.*?)':0/, replacement: vueStringReplaceFn },
                        { pattern: /'@import-vue (.*?)':0/, replacement: vueStringReplaceFn }
                    ]
                }
            }
        }

    });

     
    function vueStringReplaceFn(match, p1) {

        console.log('LOOK:', p1);
        p1 = p1.split('/');
        let dirname = p1[0];
        let filename = p1[1];

        function requireFromString(src, filename) {
          var Module = module.constructor;
          var m = new Module();
          m._compile(src, filename);
          return m.exports;
        }
        let templatePath = '../templates/'+ dirname +'/tmp/' + filename +'.js';
        let templateCode = grunt.file.read(templatePath).replace(/^export\s/m, 'module.exports = ');

        if(!templateCode) {
            throw new Error('@import-vue Could not read template file: ' + templatePath);
        }
        
        let fns = requireFromString(templateCode, '');

        let ret = '...{';
        if(fns.render) ret += 'render: ' + fns.render;
        if(fns.staticRenderFns.length) {
            ret += ', staticRenderFns: [';
            ret += fns.staticRenderFns.join(',');
            ret += ']';
        }
        ret += '}'

        return ret;
    }

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-vue-template-compiler');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-exec');
    
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('compile', ['sass', 'vue_template_compiler', 'string-replace', 'uglify', 'htmlmin', 'copy', 'exec:reloadExtension']);

}