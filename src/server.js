var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    di = require('di'),
    logger = require('./logger'),
    constant = require('./constants'),
    _ = require('lodash');

// apply the default logger config as soon as we can
logger.setup(constant.LOG_INFO, true, [constant.CONSOLE_APPENDER]);

var app = express();
var server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    log = logger.create('app');

// socket.io
var kio = io.of('/kanban').on('connection', function(socket) {
	var address = socket.handshake.address;
	console.log('New connection from ' + address.address + ':' + address.port);
});

// configure express
app.set('port', process.env.PORT || 3311);
app.set('host', 'http://localhost:' + app.get('port'));

app.configure(function() {
	// config middleware
	app.use(express.logger({ format: 'dev' }));
	app.use(express.compress());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.bodyParser());

	// static files
	var dirs = ['', 'css'];
	for (var i = 0; i < dirs.length; i++) {
		app.use('/' + dirs[i], express.static(__dirname + '/' + dirs[i]));
	}
});

// error handler
app.use(function(req, res, next) {
	res.send(404, 'Sorry, cant find that!');
});

// load config
var cfg = require('./config');
// TODO support CLI options
var config = cfg.parseConfig(__dirname + '/../kanban.conf.js', {});

// init DI injector
var plugins = {};
var module = {
	app: ['value', app],
	io: ['value', kio],
	logger: ['value', logger],
	config: ['value', config],
	plugins: ['value', plugins]
};
var injector = new di.Injector([module]);

// load internal plugins
log.debug('loading plugins...')
var PLUGIN_DIR = __dirname + '/plugins/';
var pluginList = fs.readdirSync(PLUGIN_DIR).map(function(file) {
	var name = path.basename(file, '.js');
	var plugin = injector.invoke(require(PLUGIN_DIR + file));
	if (plugin) {
		plugin.name = name;
		plugins[name] = plugin;
		return plugin;
	}
	return null;
}).filter(function(p) { return p != null; });

// TODO load custom plugins

// initialize plugins
log.debug('init plugins...');
pluginList.forEach(function(plugin) {
	if (_.isFunction(plugin.$init)) {
		plugin.$init(injector);
		log.debug("initialized '%s' plugin", plugin.name);
	}
});

// start the web server
var port = app.get('port');
server.listen(port);
console.log('Listening on port ' + port);
