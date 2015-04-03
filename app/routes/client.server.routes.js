'use strict';

module.exports = function(app) {
	// Root routing
	var client = require('../../app/controllers/client.server.controller');
	app.route('/client/scan').get(client.scan);
    app.route('/client/data').get(client.dataRw);
};
