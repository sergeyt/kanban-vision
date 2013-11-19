// authentication plugin
function plugin(app, logger) {
	var log = logger.create('auth');
	log.debug('loading...');

	// based on https://github.com/jaredhanson/passport-google signon example
	var passport = require('passport'),
	    GoogleStrategy = require('passport-google').Strategy;

	// Passport session setup.
	//   To support persistent login sessions, Passport needs to be able to
	//   serialize users into and deserialize users out of the session.  Typically,
	//   this will be as simple as storing the user ID when serializing, and finding
	//   the user by ID when deserializing.  However, since this example does not
	//   have a database of user records, the complete Google profile is serialized
	//   and deserialized.
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});


	// Use the GoogleStrategy within Passport.
	//   Strategies in passport require a `validate` function, which accept
	//   credentials (in this case, an OpenID identifier and profile), and invoke a
	//   callback with a user object.
	var host = app.get('host');
	passport.use(new GoogleStrategy({
			returnURL: host + '/auth/google/return',
			realm: host + '/'
		},
		function(identifier, profile, done) {
			// asynchronous verification, for effect...
			process.nextTick(function() {

				// To keep the example simple, the user's Google profile is returned to
				// represent the logged-in user.  In a typical application, you would want
				// to associate the Google account with a user record in your database,
				// and return that user instead.
				profile.identifier = identifier;
				return done(null, profile);
			});
		}
	));

	app.use(passport.initialize());
	app.use(passport.session());

	// GET /login
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  The first step in Google authentication will involve redirecting
	//   the user to google.com.  After authenticating, Google will redirect the
	//   user back to this application at /auth/google/return
	app.get('/login',
		passport.authenticate('google', { failureRedirect: '/' }),
		function(req, res) {
			res.redirect('/');
		});

	// GET /auth/google/return
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  If authentication fails, the user will be redirected back to the
	//   login page.  Otherwise, the primary route function function will be called,
	//   which, in this example, will redirect the user to the home page.
	app.get('/auth/google/return',
		passport.authenticate('google', { failureRedirect: '/' }),
		function(req, res) {
			res.redirect('/');
		});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
}

plugin.$inject = ['app', 'logger'];

module.exports = plugin;