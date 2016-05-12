module.exports = function(grunt) {

    grunt.initConfig({

        jshint: {
            scripts: {
                src: ['*.js']
            }
        },
        uglify: {
            scripts: {
                expand: true,
                cwd: '/',
                src: '*.js',
                dest: 'build/',
                ext: '.min.js'
            }
        },
        watch: {
            scripts: {
                files: '*.js',
                task: 'jshint:scripts'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('build', ['jshint', 'uglify']);

};
