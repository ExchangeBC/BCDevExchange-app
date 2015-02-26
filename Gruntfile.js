module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        modernizr: {

            dist: {
                // [REQUIRED] Path to the build you're using for development.
                "devFile": "remote",

                // Path to save out the built file.
                "outputFile": "public/js/modernizr-custom.js"
            }
        },
        cdnify: {
            options: {
                cdn: require('google-cdn-data')
            },
            dist: {
                html: ['public/*.html']
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-copy');

    // Load gh-pages add-on

    grunt.loadNpmTasks("grunt-modernizr");

    grunt.loadNpmTasks('grunt-google-cdn');

    grunt.registerTask('build', 'modernizr');
};