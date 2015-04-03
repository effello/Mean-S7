'use strict';

/**
 * Module dependencies.
 */

var m_os = require('os');
var m_snap7 = require('node-snap7');

module.exports.dataRw = function(req, res){
    res.send('dataRW', {
        'S7WLBit': m_snap7.S7Client.prototype.S7WLBit,
        'S7WLByte': m_snap7.S7Client.prototype.S7WLByte,
        'S7WLWord': m_snap7.S7Client.prototype.S7WLWord,
        'S7WLDWord': m_snap7.S7Client.prototype.S7WLDWord,
        'S7WLReal': m_snap7.S7Client.prototype.S7WLReal,
        'S7WLCounter': m_snap7.S7Client.prototype.S7WLCounter,
        'S7WLTimer': m_snap7.S7Client.prototype.S7WLTimer,
        'S7AreaDB': m_snap7.S7Client.prototype.S7AreaDB,
        'S7AreaPE': m_snap7.S7Client.prototype.S7AreaPE,
        'S7AreaPA': m_snap7.S7Client.prototype.S7AreaPA,
        'S7AreaMK': m_snap7.S7Client.prototype.S7AreaMK,
        'S7AreaTM': m_snap7.S7Client.prototype.S7AreaTM,
        'S7AreaCT': m_snap7.S7Client.prototype.S7AreaCT
    });
};

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

