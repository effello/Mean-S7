'use strict';


angular.module('client').controller('ClientController', ['Socket','$scope', 'Authentication',
	function(Socket,$scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        $scope.snap7LogArr = [];
        $scope.snap7log = null;
        $scope.MsgPanel = {
            msg:'Not connected :-( !',
            openLog: function(){
                var popup = $('#msg-popup');
                var panel = $('#msg-panel');
                popup.css('top', panel.css('top'));
                popup.css('left', panel.css('left'));
                popup.css('width', panel.css('width'));
                popup.stop().slideDown();
            },
            closeLog: function(){
                $('#msg-popup').stop().slideUp();
            }
        };
        $scope.ViewStats = {
            btnConnect: {
                disabled : false
            }
        };
        $scope.PLC = {
            ip:     '',
            rack:   '0',
            slot:   '2',
            tsap:   false,
            tsapLoc0: '2',
            taspLoc1: '0',
            tsapRem0: '2',
            tsapRem1: '0',
            type: 1,
            connected: false

        };
        $scope.connectInputDisabled = function(val){
            $scope.ViewStats.btnConnect.disabled = val;
        };
        $scope.snap7log = function(msg, verbose){
            if(msg == '') return;
            verbose = verbose || 'info';
            msg = '[' + (new Date).toLocaleTimeString() + '] ' + msg;
            $scope.snap7LogArr.unshift({'msg': msg, 'verbose': verbose});
            $scope.snap7LogArr = $scope.snap7LogArr.slice(0, 10);

            $scope.MsgPanel.msg = msg;
            $('#msg-panel').text(msg).removeClass(function (index, css) {
                return (css.match (/\alert-\S+/g) || []).join(' ');
            }).addClass('alert-'+verbose);

            $scope.MsgPanel.msgTable = []
            for(var i=1; i<$scope.snap7LogArr.length; i++){
                $('#msg-popup-table').append('<tr class="text-' + $scope.snap7LogArr[i].verbose +' ' + $scope.snap7LogArr[i].verbose +'"><td>' + $scope.snap7LogArr[i].msg + '</td></tr>') ;
            }

            $('#msg-panel').finish().fadeOut(100).fadeIn(100);
        };

        $scope.plcConnect = function(){
            if(!$scope.PLC.connected){
                var connObj = {};
                connObj.address = $scope.PLC.ip;
                if($scope.PLC.tsap)
                    connObj.tsap = true;
                if(connObj.tsap){
                    connObj.localTSAP = parseInt($scope.PLC.tsapLoc0,10), parseInt($scope.PLC.taspLoc1,10);
                    connObj.remoteTSAP = parseInt($scope.PLC.tsapRem0,10), parseInt($scope.PLC.tsapRem1,10);
                }else{
                    connObj.rack = parseInt($scope.PLC.rack,10);
                    connObj.slot = parseInt($scope.PLC.slot,10);
                    connObj.type = parseInt($scope.PLC.type,10);
                }
                Socket.emit('plcConnect', connObj);
                $scope.connectInputDisabled(true);
            }else{
                Socket.emit('plcDisconnect');
            }

        };
        $scope.plcDisconnect = function(){
            Socket.emit('plcDisconnect');
        };
        Socket.on('plcDisconnect_ret', function(err, execTime){
            if(err == null){
                $scope.snap7log(execTime + ' ms - Disconnected', 'success');
                $scope.connectInputDisabled(false);
                $('#btn-connect').off().on('click', $scope.plcConnect);
                $('#btn-connect').text('Connect');
            }else{
                $scope.snap7log(execTime + ' ms - ' + err, 'danger');
            }
            $scope.PLC.connected = false;
        });
        Socket.on('plcConnect_ret', function(err, execTime){
            if(err == null){
                $scope.snap7log(execTime + ' ms - Connected', 'success');
                $('#btn-connect').off().on('click', $scope.plcDisconnect);
                $('#btn-connect').text('Disconnect');
                $('#subnav li.active a[id!="scanDevices"]').click();
                $('#btn-connect').prop('disabled', false);
                $scope.PLC.connected = true;
            }
            else{
                $scope.snap7log(execTime + ' ms - ' + err, 'danger');

                $scope.connectInputDisabled(false);
            }
        });
        Socket.on('plcConnectionStatus_ret', function(err, data){
            $scope.PLC.ip =data.address;
            $scope.PLC.rack = data.rack;
            $scope.PLC.slot =data.slot;
            $scope.PLC.type = data.type;
            $scope.PLC.tsapLoc0 = data.localTSAP[0];
            $scope.PLC.tsapLoc1 = data.localTSAP[1];
            $scope.PLC.tsapRem0 = data.remoteTSAP[0];
            $scope.PLC.tsapRem0 = data.remoteTSAP[1];
            if(data.tsap)
                $('#btn-tsap').click();
            if(data.connected){
                $scope.connectInputDisabled(true);
                $('#btn-connect').off().on('click', $scope.plcDisconnect);
                $('#btn-connect').text('Disconnect');
                $('#btn-connect').prop('disabled', false);
                $scope.snap7log('Connected', 'success');
            }
        });
        Socket.emit('plcConnectionStatus');
	}
]);
