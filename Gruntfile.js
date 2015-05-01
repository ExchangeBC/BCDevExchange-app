/*
 Copyright 2015 Province of British Columbia

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and limitations under the License.
 */

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        express: {
            options: {
                // options
            },
            dev: {
                options: {
                    script: 'server.js'
                }
            }
        },

        watch: {
            express: {
                files:  [ 'app/**/*.js', 'config/**/*.json' ],
                tasks:  [ 'express:dev' ],
                options: {
                    spawn: false
                }
            },

            styles: {
                files: ['less/**/*.less'],
                tasks: ['cssmin:bcdevx']
            }
        },

        bower_concat: {
            all: {
                dest: 'build/_bower.js',
                cssDest: 'build/_bower.css',

                dependencies: {

                },
                mainFiles: {
                    'angular-table-of-contents': [ 'dest/angular-table-of-contents.min.js' ]
                },
                bowerOptions: {
                    relative: false
                }
            }
        },

        concat: {
            options: {
                // options
            },
            dist: {
                src: ['public/**/*.js', '!public/**/*.min.js'],
                dest: 'build/_bcdevx.js',
            },
        },

        less: {
            development: {
                options: {
                    /*imports: {
                        reference: [
                            "less/bcdevx-variables.less"
                        ]
                    }*/
                },
                files: {
                    "build/_bcdevx.css": ["less/**/*.less"]
                }
            }
        },

        cssmin: {
            options: {
                //options
            },
            bcdevx: {
                files: {
                    'public/css/bcdevx.min.css': ['build/_bcdevx.css']
                }
            },
            bower: {
                files: {
                    'public/css/lib.min.css': ['build/_bower.css']
                }
            }
        },

        uglify: {
            options: {
                mangle: false,
            },
            bcdevx: {
                files: {
                    'public/js/app.min.js': ['build/_bcdevx.js']
                }
            },
            bower: {
                files: {
                    'public/js/lib.min.js': ['build/_bower.js']
                }
            }
        },

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('server', [ 'express:dev', 'watch' ]);
};