'use strict';

angular.module('client').controller('ClientScanController', ['Socket','$scope', '$http',
	function(Socket, $scope, $http) {
        $scope.process = {
            running: false
        };
        $scope.progress = {
            min: 0,
            max: 100,
            value: 0
        };
		$scope.IpScan = {
            port: '102',
            startIPv4: '',
            endIPv4: '',
            hosts: []
        };
        $http.get('/client/scan').success(function(data) {
            if (data){
                $scope.IpScan.startIPv4 = data.startIPv4[0];
                $scope.IpScan.endIPv4 = data.endIPv4[0];
            }
        });
        $scope.scanDevices = function(){
            //Reset List of found PLCs
            $scope.IpScan.hosts = [];
            // deactivate Scan Button
            $scope.process.running = true;

            // Slide Down List of found PLCs
            var progressElm = angular.element( document.querySelector( '#progress' ) );
            progressElm.parent('div').slideDown();

            // Emit a Ip Scan request to the socket server
            Socket.emit('scanIp',
                {'start': $scope.IpScan.startIPv4, 'end': $scope.IpScan.endIPv4, 'port': parseInt($scope.IpScan.port, 10)}
            );
            $scope.process.running = false;
        };

        //Socket Retrieve Events
        Socket.removeAllListeners('scanIP_status');
        Socket.on('scanIP_status', function(err, res){
            $scope.process.max = res.max;
            if ($scope.process.running == false)
                $scope.process.running = true;
            var percent = Math.round((res.curr/res.max)*100);
            $scope.progress.value = percent;
            if(percent == 100){
                $('#progress').parent('div').delay(1000).slideUp();
                $scope.process.running = false;
            }
        });
        Socket.removeAllListeners('scanIP_ret');
        $scope.setIp = function (host) {
            $scope.PLC.ip = host;
        };
        Socket.removeAllListeners('scanIP_ret');
        Socket.on('scanIP_ret', function(err, res){
            if ($scope.IpScan.hosts.length >0){
                for(var i=0; i<$scope.IpScan.hosts.length;i++){
                    if(res.host != $scope.IpScan.hosts[i].host){
                        //new host
                        $scope.IpScan.hosts.push({host: res.host, port: res.port});
                    }
                }
            }else{
                // fist host found
                $scope.IpScan.hosts.push({host: res.host, port: res.port});
            }

        });
        Socket.emit('plcConnectionStatus');
	}
]);
