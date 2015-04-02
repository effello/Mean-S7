/**
 * Created by efelo on 01.04.15.
 */

var m_async = require('async');
var m_net = require('net');
var m_snap7 = require('node-snap7');

var snap7Client = new m_snap7.S7Client();
snap7Client.CONNTYPE_PG = m_snap7.S7Client.prototype.CONNTYPE_PG;
snap7Client.CONNTYPE_OP = m_snap7.S7Client.prototype.CONNTYPE_OP;
snap7Client.CONNTYPE_BASIC = m_snap7.S7Client.prototype.CONNTYPE_BASIC;

var connectionParams = {
    address: '',
    rack: '0',
    slot: '2',
    type: snap7Client.CONNTYPE_PG,
    connected: false,
    tsap: false,
    localTSAP: ['02', '00'],
    remoteTSAP: ['02', '00']
};

module.exports.onConnect = function(socket){
    socket.on('disconnect', function() {
        console.log('Socket disconnected.');
    });
    socket.on('connect', function() {
        console.log('Socket connected.');
    });
    socket.on('scanIp', function(data) {
        function checkPort(port, host, callback) {
            var sock = new m_net.Socket(), status = null;

            sock.on('connect', function() {
                status = 'open'; sock.end();
            });
            sock.setTimeout(1500);

            sock.on('timeout', function() {
                status = 'closed'; sock.destroy();
            });
            sock.on('error', function(exception) {
                status = 'closed';
            });
            sock.on('close', function(exception) {
                callback(null, status, host, port);
            });
            sock.connect(port, host);
        }

        var startIP = data.start.split('.').map(function(item) { return parseInt(item, 10); });
        var endIP = data.end.split('.').map(function(item) { return parseInt(item, 10); });
        //var start1, start2, start3;
        //var end1, end2, end3;
        var tasks = [];
        for (var a = startIP[0]; a <= endIP[0]; a++) {
            if (a == startIP[0]) var start1 = startIP[1]; else start1 = 0;
            if (a == endIP[0]) var end1 = endIP[1]; else var end1 = 255;
            for (var b = start1; b <= end1; b++) {
                if (b == startIP[1] && a == startIP[0]) var start2 = startIP[2]; else var start2 = 0;
                if (b == endIP[1] && a == endIP[0]) var end2 = endIP[2]; else var end2 = 255;
                for (var c = start2; c <= end2; c++) {
                    if (c == startIP[2] && b == startIP[1] && a == startIP[0]) var start3 = startIP[3]; else var start3 = 0;
                    if (c == endIP[2] && b == endIP[1] && a == endIP[0]) var end3 = endIP[3]; else var end3 = 255;
                    for (var d = start3; d <= end3; d++)
                        tasks.push(a + '.' + b + '.' + c + '.' + d);
                }
            }
        }
        var requestCount = tasks.length;
        var currentRequestCount = 0;
        socket.emit('scanIP_status', null, { 'curr': currentRequestCount, 'max': requestCount });

        m_async.parallelLimit(tasks.map(function(ip) {
            return m_async.waterfall.bind(m_async, [
                function(callback) {
                    checkPort(data.port, ip, callback);
                },
                function(res, host, port, callback) {
                    currentRequestCount++;
                    socket.emit('scanIP_status', null, { 'curr': currentRequestCount, 'max': requestCount });
                    if (res === 'open')
                        socket.emit('scanIP_ret', null, { 'host': host, 'port': port });
                    callback(null);
                }]);
        }), 64);
    });
    socket.on('plcConnect', function(data) {
        var onConnect = function(err) {
            if (err)
                socket.emit('plcConnect_ret', snap7Client.ErrorText(err), snap7Client.ExecTime());
            else {
                connectionParams.address = data.address;
                if (data.tsap) {
                    connectionParams.localTSAP = data.localTSAP;
                    connectionParams.remoteTSAP = data.remoteTSAP;
                } else {
                    connectionParams.rack = data.rack;
                    connectionParams.slot = data.slot;
                    connectionParams.type = data.type;
                }
                connectionParams.tsap = data.tsap;
                connectionParams.connected = true;
                socket.emit('plcConnect_ret', null, snap7Client.ExecTime());
            }
        };
        if (data.tsap) {
            if (!snap7Client.SetConnectionParams(data.address, parseInt(data.localTSAP.join(''), 16), parseInt(data.remoteTSAP.join(''), 16)))
                return socket.emit('plcConnect_ret', snap7Client.ErrorText(err), snap7Client.ExecTime());

            snap7Client.Connect(onConnect);
        } else {
            if (!snap7Client.SetConnectionType(parseInt(data.type), 10))
                return socket.emit('plcConnect_ret', snap7Client.ErrorText(err), snap7Client.ExecTime());

            snap7Client.ConnectTo(data.address, parseInt(data.rack, 10), parseInt(data.slot, 10), onConnect);
        }
    });
    socket.on('plcDisconnect', function(data) {
        if (snap7Client.Disconnect())
            socket.emit('plcDisconnect_ret', null, snap7Client.ExecTime());
        else
            socket.emit('plcDisconnect_ret', snap7Client.ErrorText(snap7Client.LastError()), snap7Client.ExecTime());
    });
    socket.on('plcConnectionStatus', function() {
        connectionParams.connected = snap7Client.Connected();
        socket.emit('plcConnectionStatus_ret', null, connectionParams);
    });
    socket.on('plcGetCpuInfo', function() {
        var cpuInfo;
        if (cpuInfo = snap7Client.GetCpuInfo())
            socket.emit('plcGetCpuInfo_ret', null, cpuInfo, snap7Client.ExecTime());
        else
            socket.emit('plcGetCpuInfo_ret', snap7Client.ErrorText(snap7Client.LastError()), null, snap7Client.ExecTime());
    });

    socket.on('plcGetCpInfo', function() {
        var cpInfo;
        if (cpInfo = snap7Client.GetCpInfo())
            socket.emit('plcGetCpInfo_ret', null, cpInfo, snap7Client.ExecTime());
        else
            socket.emit('plcGetCpInfo_ret', snap7Client.ErrorText(snap7Client.LastError()), null, snap7Client.ExecTime());
    });

    socket.on('plcGetOrderCode', function() {
        var orderCode;
        if (orderCode = snap7Client.GetOrderCode())
            socket.emit('plcGetOrderCode_ret', null, orderCode, snap7Client.ExecTime());
        else
            socket.emit('plcGetOrderCode_ret', snap7Client.ErrorText(snap7Client.LastError()), null, snap7Client.ExecTime());
    });

    socket.on('readArea', function(data) {
        snap7Client.ReadArea(data.area, data.DB, data.start, data.amount, data.wordLen, function(err, res) {
            if (err)
                socket.emit('readArea_ret', snap7Client.ErrorText(err), null, snap7Client.ExecTime());
            else
                socket.emit('readArea_ret', null, res.toJSON(), snap7Client.ExecTime());
        });
    });
    socket.on('writeArea', function(data) {
        snap7Client.WriteArea(data.area, data.DB, data.start, data.amount, data.wordLen, new Buffer(data.buffer), function(err) {
            if (err)
                socket.emit('writeArea_ret', snap7Client.ErrorText(err), null, snap7Client.ExecTime());
            else
                socket.emit('writeArea_ret', null, null, snap7Client.ExecTime());
        });
    });
};
