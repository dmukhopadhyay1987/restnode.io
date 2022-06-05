const log4js = require('log4js');
const config = require('./log4js_config');

log4js.configure({
	appenders: {
		'dfilelog': {
			type: config.logprofiles.customProfile.components.errorLog.type,
			filename: config.logprofiles.customProfile.components.errorLog.filename,
			pattern: config.logprofiles.customProfile.components.errorLog.bkpFileNamePattern,
			maxLogSize: config.logprofiles.customProfile.components.errorLog.maxLogFileSize,
			backups: config.logprofiles.customProfile.components.errorLog.backups,
			compress: config.logprofiles.customProfile.components.errorLog.compress,
			encoding: config.logprofiles.customProfile.components.errorLog.encoding,
			layout: {
				type: 'pattern',
				pattern: config.logprofiles.customProfile.components.errorLog.logPattern
			}
		},
		'filelog': {
			type: config.logprofiles.customProfile.components.infoLog.type,
			filename: config.logprofiles.customProfile.components.infoLog.filename,
			pattern: config.logprofiles.customProfile.components.infoLog.bkpFileNamePattern,
			maxLogSize: config.logprofiles.customProfile.components.infoLog.maxLogFileSize,
			backups: config.logprofiles.customProfile.components.infoLog.backups,
			compress: config.logprofiles.customProfile.components.infoLog.compress,
			encoding: config.logprofiles.customProfile.components.infoLog.encoding,
			layout: {
				type: 'pattern',
				pattern: config.logprofiles.customProfile.components.infoLog.logPattern
			}
		},
		'dbfilelog': {
			type: config.logprofiles.dbProfile.components.dbLog.type,
			filename: config.logprofiles.dbProfile.components.dbLog.filename,
			pattern: config.logprofiles.dbProfile.components.dbLog.bkpFileNamePattern,
			maxLogSize: config.logprofiles.dbProfile.components.dbLog.maxLogFileSize,
			backups: config.logprofiles.dbProfile.components.dbLog.backups,
			compress: config.logprofiles.dbProfile.components.dbLog.compress,
			encoding: config.logprofiles.dbProfile.components.dbLog.encoding,
			layout: {
				type: 'pattern',
				pattern: config.logprofiles.dbProfile.components.dbLog.logPattern
			}
		},
		'conlog': {
			type: 'console',
			encoding: 'utf-8',
			layout: {
				type: 'pattern',
				pattern: config.logprofiles.customProfile.components.consoleLog.logPattern
			}
		}
	},
	categories: {
		'drofl': {
			appenders: ['dfilelog'],
			level: config.logprofiles.customProfile.components.errorLog.level
		},
		'rofl': {
			appenders: ['filelog'],
			level: config.logprofiles.customProfile.components.infoLog.level
		},
		'conl': {
			appenders: ['conlog'],
			level: config.logprofiles.customProfile.components.consoleLog.level
		},
		'dbrofl': {
			appenders: ['dbfilelog'],
			level: config.logprofiles.dbProfile.components.dbLog.level
		},
		'default': {
			appenders: ['dfilelog', 'filelog', 'conlog'],
			level: config.logprofiles.defaultProfile.level
		}
	}
});

class Rofl {

	constructor () {
		this.logger = {};
		this.dblogger = {};
		if (config.logprofiles.defaultProfile.enabled) {
			this.logger['default'] = log4js.getLogger();
		} else {
			for (var component in config.logprofiles.customProfile.components) {
				var comp = config.logprofiles.customProfile.components[component];
				if (comp.enabled) {
					this.logger[component] = log4js.getLogger(comp.name);
				}
			}
		}
		//db logging
		if(config.logprofiles.dbProfile.enabled) {
			for (var component in config.logprofiles.dbProfile.components) {
				var comp = config.logprofiles.dbProfile.components[component];
				if (comp.enabled) {
					this.dblogger[component] = log4js.getLogger(comp.name);
				}
			}
		}
	}

	getLogMessage (execid, req, msg, data) {
		var isMsg = false;
		var isData = false;
		if (msg && msg !== undefined && msg !== "" && msg.length !== 0) {
			isMsg = true;
		}
		if ((typeof data === 'object' && data !== null && Object.keys(data).length > 0) || (data && data !== undefined && data !== "" && data.length !== 0)) {
			isData = true;
		}
		var loggingPref = config.loggingPref;
		var logMessage = (loggingPref.execid.enabled && execid ? '[EXEC] ' + execid + ' ' : '');
		if (loggingPref.request.enabled) {
			if (req && typeof req === 'object' && req !== null && req.url) {
				if (req.params && Object.keys(req.params).length > 0) {
					logMessage += (loggingPref.request.params.url.enabled ? '[METHOD] ' + req.url + ' | ' : '') + (!isMsg && !isData && loggingPref.request.params.content.enabled ? 'request-data: ' + JSON.stringify(req.params) + ' | ' : '');
				} else if (req.query && Object.keys(req.query).length > 0) {
					logMessage += (loggingPref.request.params.url.enabled ? '[METHOD] ' + req.url + ' | ' : '') + (!isMsg && !isData && loggingPref.request.params.content.enabled ? 'request-data: ' + JSON.stringify(req.query) + ' | ' : '');
				} else if (req.body && Object.keys(req.body).length > 0) {
					logMessage += (loggingPref.request.params.url.enabled ? '[METHOD] ' + req.url + ' | ' : '') + (!isMsg && !isData && loggingPref.request.params.content.enabled ? 'request-data: ' + JSON.stringify(req.body) + ' | ' : '');
				} else {
					logMessage += (loggingPref.request.params.url.enabled ? '[METHOD] ' + req.url + ' | NO REQ PARAM OR BODY | ' : '')
				}
			}
		}
		if (isMsg) {
			logMessage += (loggingPref.message.enabled ? msg : '');
		}
		if (typeof data === 'object' && data !== null && Object.keys(data).length > 0) {
			logMessage += (loggingPref.data.enabled ? ' : ' + JSON.stringify(data) : '');
		} else if (data && data !== undefined && data !== "" && data.length !== 0) {
			logMessage += (loggingPref.data.enabled ? ' : ' + data : '');
		}
		return logMessage;
	}

	log (method, execid, req, msg, data) {
		if (config.logprofiles.defaultProfile.enabled) {
			this.logger['default'][method](this.getLogMessage(execid, req, msg, data));
		} else {
			for (var component in config.logprofiles.customProfile.components) {
				var comp = config.logprofiles.customProfile.components[component];
				if (comp.enabled) {
					this.logger[component][method](this.getLogMessage(execid, req, msg, data));
				}
			}
		}
	}

	logdb (method, msg) {
		if (config.logprofiles.dbProfile.enabled) {
			for (var component in config.logprofiles.dbProfile.components) {
				var comp = config.logprofiles.dbProfile.components[component];
				if (comp.enabled) {
					this.dblogger[component][method](msg);
				}
			}
		}
	}
	
	dblog (method, msg) {
		this.logdb(method, msg);
	}
	
	trace (execid, req, msg, data) {
		this.log('trace', execid, req, msg, data);
	}
	
	debug (execid, req, msg, data) {
		this.log('debug', execid, req, msg, data);
	}
	
	info (execid, req, msg, data) {
		this.log('info', execid, req, msg, data);
	}
	
	warn (execid, req, msg, data) {
		this.log('warn', execid, req, msg, data);
	}
	
	error (execid, req, msg, data) {
		this.log('error', execid, req, msg, data);
	}
	
	fatal (execid, req, msg, data) {
		this.log('fatal', execid, req, msg, data);
	}
}

module.exports = new Rofl();