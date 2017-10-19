module.exports = function(grunt) {
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        /*
            uglify: {
                dev: {
                    options: {
                        mangle: false,
                        preserveComments: true,
                        beautify: true
                    },
                    files: {
                        '../js/min/app.js' : ['../js/angular.rangeSlider.js', '../js/mousetrap.js', '../js/app.js']
                    }
                },
                dist: {
                    options: {
                        mangle: true,
                        preserveComments: false,
                        beautify: false
                    },
                    files: {
                        '../js/min/app.js' : ['../js/angular.rangeSlider.js', '../js/mousetrap.js', '../js/app.js']
                    }
                }
            },
        */

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
            }
            /*
            ,
            js: {
                files: ['../js/*.js'],
                tasks: ['uglify:dev'],
                options: {
                    spawn: false
                }
            }*/
        }

    });


    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // grunt.loadNpmTasks('grunt-contrib-uglify');

    //grunt.registerTask('default', ['watch:js']);
}