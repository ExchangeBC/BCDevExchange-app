module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        'copy': {
            main: {
                src: 'deployment_config/GitHub.io.CNAME.txt',
                dest: 'app/CNAME'
            }
        },
        'gh-pages': {
            options: {
                base: 'app',
                repo: 'git@github.com:BCDevX/BCDevX.github.io.git',
                branch: 'master'

            },
            src: ['**']
        }

    });

    grunt.loadNpmTasks('grunt-contrib-copy');

    // Load gh-pages add-on
    grunt.loadNpmTasks('grunt-gh-pages');

    // Default task(s).
    grunt.registerTask('default', ['copy', 'gh-pages']);

};