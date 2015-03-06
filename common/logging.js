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

var winston = require('winston');

function Logging() {
    // always return the singleton instance, if it has been initialised once already
    if (Logging.prototype._singletonInstance) {
        return Logging.prototype._singletonInstance;
    }

    // define custom levels
    var customLevels = {
        levels: {
            silly: 0,
            verbose: 1,
            info: 2,
            http: 3,
            warn: 4,
            error: 5,
            silent: 6
        }
    };


    // use console logger
    this.logger = new winston.Logger({
        transports: [new (winston.transports.Console)()],
        levels: customLevels.levels
    });


    // Setup some defaults
    this.logger.exitOnError = true;

    // Make myself the single instance for next use
    Logging.prototype._singletonInstance = this;

    // All done
    console.log('Logging started');

    return Logging.prototype._singletonInstance;
};

module.exports = Logging();
