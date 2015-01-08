module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        'gh-pages': {
            options: {
                base: 'app',
                repo: 'https://github.com/BCDevX/BCDevX.github.io.git',
                branch: 'master'

            },
            src: ['**']
        }
    });

    // Load gh-pages add-on
    grunt.loadNpmTasks('grunt-gh-pages');

    // Default task(s).
    grunt.registerTask('default', ['gh-pages']);

};