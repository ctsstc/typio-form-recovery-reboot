module.exports = function(grunt) {
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                // mangle: false,
                // preserveComments: true,
                // beautify: true,
                // verbose: true,
                // sourceMap: true,
                mangle: true,
                preserveComments: false,
                beautify: false,
                verbose: false,
                sourceMap: false,
            },
            content: {
                files: {

                    // Runs isolated on every page (not in iframes)
                    '../js/min/content.min.js' : [

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
                        '../js/controllers/main.js',
                            '../js/controllers/main/recoveryDialog.js',
                            '../js/controllers/main/contextMenu.js',
                            '../js/controllers/main/inputSaver.js',
                            '../js/controllers/main/keyboardShortcuts.js',
                            '../js/controllers/main/saveIndicator.js',
                    ],

                    // Runs as content script
                    '../js/min/frame.min.js' : [
                        '../js/modules/editableManager/editableManager.pathGenerator.js',
                        '../js/modules/cache.js',

                        '../js/controllers/frame.js',
                            '../js/controllers/frame/topOnly.js',
                            '../js/controllers/frame/childOnly.js',
                    ],

                    '../js/min/blacklisted.min.js' : [
                        '../js/controllers/blacklisted.js',
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
                    dest: '../css/',
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
            }
        }

    });


    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['watch']);
}