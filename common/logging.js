var winston = require('winston');
var Logentries = require('winston-logentries');

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

    if (process.env.NODE_ENV == 'production') {
        
        this.logger = new winston.Logger({
            transports: [new winston.transports.Logentries({token: 'f8c89aff-0de8-4ef5-b8b8-b977644c89b1'})],
            levels: customLevels.levels
        });

    } else {
        // use console logger
        this.logger = new winston.Logger({
            transports: [new (winston.transports.Console)()],
            levels: customLevels.levels
        });
    }

    // Setup some defaults
    this.logger.exitOnError = true;

    // Make myself the single instance for next use
    Logging.prototype._singletonInstance = this;

    // All done
    console.log('Logging started');

    return Logging.prototype._singletonInstance;
};

module.exports = Logging();
