module.exports = function(grunt) {
    grunt.initConfig({

        exec: {
          reloadExtension: 'start chrome http://reload.extensions/ --new-window'
        },

    });



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
