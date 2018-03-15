var sanitizeHtml = require('sanitize-html');
var tagsArray = require('./allowedTags');

//Returns the html data that contains only specific tags, attributes and has CSS stripped away
var sanitize = function(html, callback) {
	return sanitizeHtml(html, {
		allowedTags: tagsArray,
		allowedAttributes: false,
		allowedSchemes: [ 'http', 'https' ],
		allowedSchemesByTag: {},
		allowProtocolRelative: true
	});
};

module.exports = sanitize;
