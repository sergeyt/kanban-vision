// boards express handlers
function plugin(app, io, logger) {
	var log = logger.create('boards');
	log.debug('loading...');

	// gets list of available boards
	app.get('/boards/list', function(req, res) {
		// TODO implement
		req.json([]);
	});

	// gets specified board
	app.get('/boards/:board', function(req, res) {
		// TODO implement
		req.json({});
	});
}

plugin.$inject = ['app', 'io', 'logger'];

module.exports = plugin;
