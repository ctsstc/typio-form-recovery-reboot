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
            templates: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    src: ['../templates/**/*.tpl'],
                    dest: '../publish/templates'
                }]
            }
        },

        copy: {
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

                    // Runs isolated on every page (not in iframes)
                    '../publish/js/options.js' : [

                        // Modules
                        '../js/modules/blacklist.js',

                        // Controllers
                        '../js/controllers/options.js',
                    ],


                    // Runs isolated on every page (not in iframes)
                    '../publish/js/popup.js' : [

                        // Modules
                        '../js/modules/blacklist.js',


                        // Controllers
                        '../js/controllers/popup.js',
                    ],


                    // Runs isolated on every page (not in iframes)
                    '../publish/js/background.js' : [

                        // Modules
                        '../js/modules/blacklist.js',


                        // Controllers
                        '../js/controllers/background.js',
                    ],

                    // Runs isolated on every page (not in iframes)
                    '../publish/js/content.js' : [

                        // Modules
                        '../js/modules/initHandler.js',
                        '../js/modules/helpers.js',
                        '../js/modules/options.js',
                        '../js/modules/db/db.js',
                        '../js/modules/db/db.maintenance.js',
                        '../js/modules/db/db.convertLegacy.js',
                        '../js/modules/db/indexedDBDriver.js',
                        '../js/modules/editableManager/editableManager.pathGenerator.js',
                        '../js/modules/editableManager/editableManager.pathResolver.js',
                        '../js/modules/editableManager/editableManager.placeholders.js',
                        '../js/modules/editableManager/editableManager.rules.js',
                        '../js/modules/editableManager/editableManager.js',
                        '../js/modules/ui.js',
                        '../js/modules/editablePicker.js',
                        '../js/modules/recoveryDialog.js',
                        '../js/modules/contextMenu.js',
                        '../js/modules/saveIndicator.js',
                        '../js/modules/cache.js',
                        '../js/modules/DOMEvents.js',

                        // Controllers
                        '../js/controllers/content.js',
                            '../js/controllers/content/recoveryDialog.js',
                            '../js/controllers/content/contextMenu.js',
                            '../js/controllers/content/inputSaver.js',
                            '../js/controllers/content/keyboardShortcuts.js',
                            '../js/controllers/content/saveIndicator.js',
                    ],

                    // Runs as content script
                    '../publish/js/content.frameInjector.js' : [
                        '../js/modules/editableManager/editableManager.pathGenerator.js',
                        '../js/modules/cache.js',

                        '../js/controllers/content.frameInjector.js',
                            '../js/controllers/content.frameInjector/topOnly.js',
                            '../js/controllers/content.frameInjector/childOnly.js',
                    ],

                    '../publish/js/content.blacklisted.js' : [
                        '../js/controllers/content.blacklisted.js',
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
                files: ['../html/**/*.html', '../templates/**/*.tpl'],
                tasks: ['htmlmin'],
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
            }
        }

    });


    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['watch']);

}