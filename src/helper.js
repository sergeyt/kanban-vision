var ABS_URL = /^https?:\/\//;
exports.isAbsoluteUrl = function(url) {
	return ABS_URL.test(url);
};
