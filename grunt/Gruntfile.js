module.exports = function(grunt) {
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                mangle: false,
                preserveComments: true,
                beautify: true,
                verbose: true
            },
            content: {
                files: {

                    // Runs isolated on every page (not in iframes)
                    '../js/min/content.min.js' : [

                        // Libraries
                        '../js/libs/mousetrap.min.js',
                        '../js/libs/mousetrap-global-bind.min.js',

                        // Modules
                        '../js/shared/helpers.js', // Todo: Need to fix wtf public namespace big nono
                        '../js/modules/indexedDBDriver.js',
                        '../js/modules/options.js',
                        '../js/modules/db.js',
                        '../js/modules/ui.js',
                        '../js/modules/editableManagerShared.js',
                        '../js/modules/editableManager.js',
                        '../js/modules/editablePicker.js',
                        // '../js/modules/toast.js',
                        '../js/modules/dialog.js',
                        '../js/modules/context.js',

                        // Controllers
                        '../js/controllers/main.js',
                            '../js/controllers/main/contextMenu.js',
                            '../js/controllers/main/inputSaver.js',
                            '../js/controllers/main/keyboardShortcuts.js',
                            '../js/controllers/main/recoveryDialog.js',
                    ],

                    // Runs as content script
                    '../js/min/frame.min.js' : [
                        '../js/modules/editableManagerShared.js',
                        '../js/shared/helpers.js', // Todo: Need to fix wtf public namespace big nono

                        '../js/controllers/frame.js',
                            '../js/controllers/frame/topOnly.js',
                            '../js/controllers/frame/childOnly.js',
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