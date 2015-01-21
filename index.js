var express = require('express');
var logger = require('./common/logging.js').logger;

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/app'));

app.listen(app.get('port'), function() {
    logger.info("Node app is running on port " + app.get('port'));
})