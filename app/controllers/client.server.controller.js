'use strict';

/**
 * Module dependencies.
 */

var m_os = require('os');

module.exports.scan = function(req, res) {
    var interfaces = m_os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family == 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    var startAddresses = addresses.map(function(ip) {
        ip = ip.split('.');
        ip[3] = '1';
        return ip.join('.');
    });

    var endAddresses = addresses.map(function(ip) {
        ip = ip.split('.');
        ip[3] = '255';
        return ip.join('.');
    });
    //socketio.sockets.emit('scanDevices_ret', 'Started...'); // emit an event for all connected clients
    res.json({ startIPv4: startAddresses, endIPv4: endAddresses });
};

