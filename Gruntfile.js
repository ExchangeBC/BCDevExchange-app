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
                tasks:  [ 'jshint', 'express:dev' ],
                options: {
                    spawn: false
                }
            },

            app: {
                files: ['public/**/*.js', '!public/**/*.min.js'],
                tasks: ['jshint', 'concat', 'uglify:bcdevx']
            },

            styles: {
                files: ['less/bcdevx/**/*.less'],
                tasks: ['less:bcdevx', 'cssmin:bcdevx']
            },

            bootstrap: {
                files: ['less/shared/**/*.less'],
                tasks: ['less:bootstrap', 'cssmin:bower']
            }
        },

        bower_concat: {
            all: {
                dest: 'build/_bower.js',
                cssDest: 'build/_bower.css',

                dependencies: {

                },
                exclude: [
                    'bootstrap' // BCDevExchange uses a customized version of bootstrap, will be compiled later
                ],
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
            bootstrap: {
                files: {
                    "build/_yeti.css": [ "less/shared/bcdevx-variables.less" ]
                }
            },
            bcdevx: {
                files: {
                    "build/_bcdevx.css": [ "less/bcdevx/bcdevx-app.less" ]
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
                    'public/css/lib.min.css': ['build/_yeti.css', 'build/_bower.css']
                }
            }
        },

        uglify: {
            bcdevx: {
                options: {
                    mangle: false,
                },
                files: {
                    'public/js/app.min.js': ['build/_bcdevx.js']
                }
            },
            bower: {
                options: {
                    mangle: false,
                },
                files: {
                    'public/js/lib.min.js': ['build/_bower.js', 'bower_components/bootstrap/dist/js/bootstrap.js']
                }
            }
        },

        copy: {
            fonts: {
                cwd: 'bower_components/bootstrap/fonts/',
                src: '**',
                dest: 'public/fonts/',
                flatten: true,
                filter: 'isFile',
                expand: true,
            },
        },

        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },

            scripts: {
                src: ['public/**/*.js', 'app/**/*.js', '!public/js/**/*.js']
            }
        },

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['jshint', 'bower_concat', 'concat', 'copy', 'uglify', 'less', 'cssmin']);
    grunt.registerTask('server', [ 'express:dev', 'watch' ]);
};