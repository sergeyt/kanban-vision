// fogbugz client // TODO public as separate npm package

function plugin(logger, config) {
	var log = logger.create('fogbugz');
	log.debug('loading...');

	return {
		$init: function() {
		},
		login: function(user) {
			throw new Error("no impl!");
		},
		logout: function(token) {
			throw new Error("no impl!");
		},
		list: function(token) {
			throw new Error("no impl!");
		}
	};
}

plugin.$inject = ['logger', 'config.fogbugz'];

module.exports = plugin;