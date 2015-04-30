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

        basePath: './',

        exclude:[
            'public/bower_components/**/*.spec.js',
            'public/bower_components/**/*Spec.js'
        ],

        files: [
            'public/bower_components/angular/angular.js',
            'public/bower_components/angular-route/angular-route.js',
            'public/bower_components/angular-resource/angular-resource.js',
            'public/bower_components/angular-messages/angular-messages.js',
            'public/bower_components/jquery/dist/jquery.js',
            'public/bower_components/respond-minmax/dest/respond.min.js',
            'public/bower_components/angulartics/dist/angulartics.min.js',
            'public/bower_components/angulartics/dist/angulartics-ga.min.js',
            'public/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'public/bower_components/angular-sanitize/angular-sanitize.min.js',
            'public/bower_components/showdown/compressed/Showdown.min.js',
            'public/bower_components/angular-markdown-directive/markdown.js',
            'public/bower_components/angular-encode-uri/dist/angular-encode-uri.min.js',
            'public/bower_components/moment/min/moment.min.js',
            'public/bower_components/angular-moment/angular-moment.min.js',
            'public/bower_components/gsap/src/uncompressed/TweenMax.js',
            'public/bower_components/ngFx/dist/ngFx.js',
            'public/bower_components/angular-animate/angular-animate.js',
            'public/bower_components/angular-ui-utils/ui-utils.min.js',
            'public/bower_components/angular-table-of-contents/dest/angular-table-of-contents.js',
            'public/bower_components/angular-scroll/angular-scroll.js',
            'public/bower_components/showdown-icon/showdown-icon.js',
            'public/bootstrap/dist/js/bootstrap.js',

            'public/bower_components/spin.js/spin.js',
            'public/bower_components/angular-spinner/angular-spinner.js',

            'public/app.js',
            'public/signup/signup.js',
            'public/login/auth.js',
            'public/login/login-list.directive.js',
            'public/home/home.js',
            'public/account/account.js',
            'public/account/account-service.js',
            'public/lab/lab.js',
            'public/resources/resources.js',
            'public/projects/projects.js',
            'public/people/people.js',
            'public/disclaimer/disclaimer.js',
            'public/numbers/numbers.js',
            'public/programs/showdown-extensions.js',
            'public/programs/programs-module.js',
            'public/programs/programs.js',
            'public/programs/program-service.js',
            'public/programs/edit-programs.js',
            'public/programs/view-program.js',
            'public/js/*.js',

            'public/**/*.spec.js'

        ],

        autoWatch: true,

        port:9876,

        colors:true,

        logLevel: config.LOG_INFO,

        frameworks: ['mocha', 'chai'],

        browsers: ['Chrome'],

        plugins: [
            'karma-chrome-launcher',
            'karma-chai',
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
