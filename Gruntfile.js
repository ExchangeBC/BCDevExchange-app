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
        },
        'rename': {
            'CNAME': {
                src: 'deployment_config/Github.io.CNAME',
                dest: 'app/CNAME'
            }
        }
    });

    grunt.loadNpmTasks('grunt-rename');

    // Load gh-pages add-on
    grunt.loadNpmTasks('grunt-gh-pages');

    // Default task(s).
    grunt.registerTask('default', ['rename', 'gh-pages']);

};