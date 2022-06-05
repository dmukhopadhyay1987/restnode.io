var mongoConfig = require('../db/mongo_config');
var MongoLogger = require('mongodb').Logger;
var rofl = require('./file_logger');

class DBRofl {

    getDBMessage (ctx) {
        var loggingPref = mongoConfig.logging.loggingPref;
        var logMessage = '';
        for(var attr in loggingPref) {
            logMessage += (loggingPref[attr].enabled ? '[' + loggingPref[attr].prefix + '] ' + ctx[attr] + ' | ' : '');
        }
        return logMessage;
    }

    initDbLogging () {
        if(mongoConfig.logging.enabled) {
            MongoLogger.setLevel(mongoConfig.logging.level);
            MongoLogger.filter('class', mongoConfig.logging.class);
            MongoLogger.setCurrentLogger((msg, context) => {
                rofl.dblog(context.type, getDBMessage(context));
            });
        }
    }
};

module.exports = new DBRofl();