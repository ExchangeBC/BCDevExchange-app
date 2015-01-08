module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        'gh-pages': {
            options: {
                base: 'app'
            },
            src: ['**']
        }
    });

    // Load gh-pages add-on
    grunt.loadNpmTasks('grunt-gh-pages');

    // Default task(s).
    grunt.registerTask('default', ['gh-pages']);

};