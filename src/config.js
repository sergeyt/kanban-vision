var path = require('path'),
    logger = require('./logger'),
    constant = require('./constants'),
    _ = require('lodash'),
    log = logger.create('config');

function normalizeConfig(config, configFilePath) {
	return config;
}

var Config = function() {
	var config = this;

	this.LOG_DISABLE = constant.LOG_DISABLE;
	this.LOG_ERROR = constant.LOG_ERROR;
	this.LOG_WARN = constant.LOG_WARN;
	this.LOG_INFO = constant.LOG_INFO;
	this.LOG_DEBUG = constant.LOG_DEBUG;

	this.set = function(newConfig) {
		Object.keys(newConfig).forEach(function(key) {
			config[key] = newConfig[key];
		});
	};
};

var CONFIG_SYNTAX_HELP = '  module.exports = function(config) {\n' +
                         '    config.set({\n' +
                         '      // your config\n' +
                         '    });\n' +
                         '  };\n';

var parseConfig = function(configFilePath, cliOptions) {
	var configModule;
	if (configFilePath) {
		log.debug('Loading config %s', configFilePath);

		try {
			configModule = require(configFilePath);
		} catch(e) {
			if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(configFilePath) !== -1) {
				log.error('File %s does not exist!', configFilePath);
			} else {
				log.error('Invalid config file!\n  ' + e.stack);
			}
			return process.exit(1);
		}
		if (!_.isFunction(configModule)) {
			log.error('Config file must export a function!\n' + CONFIG_SYNTAX_HELP);
			return process.exit(1);
		}
	} else {
		// if no config file path is passed, we define a dummy config module.
		configModule = _.noop;
	}

	var config = new Config();

	try {
		configModule(config);
	} catch(e) {
		log.error('Error in config file!\n', e);
		return process.exit(1);
	}

	// merge the config from config file and cliOptions (precendense)
	config.set(cliOptions);

	// configure the logger as soon as we can
	logger.setup(config.logLevel, config.colors, config.loggers);

	return normalizeConfig(config, configFilePath);
};

// PUBLIC API
exports.parseConfig = parseConfig;
