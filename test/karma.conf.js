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


module.exports = function (config) {
    config.set({

        files : [
          '../public/js/lib.min.js',
          '../public/js/app.min.js',
        ],

        exclude:[
            'public/bower_components/**/*.spec.js',
            'public/bower_components/**/*Spec.js'
        ],

        frameworks: ['mocha'],

        plugins : [
            'karma-safari-launcher',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-mocha',
            'karma-junit-reporter'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        },

        client: {
            args: ['--grep', '<pattern>'],
            mocha: {
                reporter: 'html', // change Karma's debug.html to the mocha web reporter
                ui: 'tdd'
            }
        }
    });
};
