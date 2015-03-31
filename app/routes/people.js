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
var async = require('async');
var request = require('request');
var config = require('config');
var logger = require('../../common/logging.js');

module.exports = function(app, db, passport) {
    app.get('/people', function(req, res) {

        res.send({"people": [
            {
                "title": "Jane the Developer",
                "notes": "Jane is a developer with a focus on object-oriented custom implementation solutions. She brings a strong attention " +
                "to detail and quality to her work, and excels at rapidly learning new systems and technologies and translating that knowledge into " +
                "results. Jane is a team player with solid interpersonal skills and is able to build strong working relationships to achieve common goals.",
                "tags": [
                    {
                        "id": "22dd43",
                        "display_name": "Java"
                    },
                    {
                        "id": "33ae44",
                        "display_name": "Software Development"
                    },
                    {
                        "id": "ccde23",
                        "display_name": "Agile Methodologies"
                    },
                    {
                        "id": "77edaa",
                        "display_name": "JUnit"
                    }
                ],
                "record_last_modified": "2015-03-08",
                "originName": "LinkedIn",
                "repoURL": "",
                "profileURL": ""
            },
            {
                "title": "Dave the Developer",
                "notes": "Full stack Ruby/Rails developer with experience in e-commerce, social networking, and event management.",
                "tags": [
                    {
                        "id": "dd5623",
                        "display_name": "Git"
                    },
                    {
                        "id": "aa32ac",
                        "display_name": "Amazon EC2"
                    },
                    {
                        "id": "ff33ee",
                        "display_name": "Ruby on Rails"
                    },
                    {
                        "id": "bb44ed",
                        "display_name": "jQuery"
                    }
                ],
                "record_last_modified": "2015-03-04",
                "originName": "LinkedIn",
                "repoURL": "",
                "profileURL": ""
            }
        ]});

    });
}