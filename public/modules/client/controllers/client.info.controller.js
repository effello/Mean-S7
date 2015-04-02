/**
 * Created by efelo on 31.03.15.
 */
'use strict';

angular.module('client').controller('ClientInfoController', ['$scope','Socket',
    function($scope, Socket) {
        $scope.Catalog = {
            Code: '#### ###-######-####',
            V1: '#',
            V2: '#',
            V3: '#',
            commInfo: {
                MaxPduLengt: '###',
                MaxConnections: '###',
                maxMPI: '###',
                MaxBusRate: '###'
            },
            unitInfo: {
                ModuleTypeName: '###',
                SerialNumber: '###',
                Copyright: '###',
                ASName: '###',
                ModuleName: '###'
            }
        };
        $scope.onData = function(err, data, execTime){
            var msgExecTime = '';
            if(execTime) msgExecTime = execTime + ' ms - ';
            if(err == null){
                for(var prop in data)
                    $('#'+prop).text(data[prop]);
                $scope.snap7log(msgExecTime + 'System Info OK', 'success');
            }else{
                $scope.snap7log(msgExecTime + err, 'danger');
            }
        };
        Socket.removeAllListeners('plcGetCpuInfo_ret');
        Socket.removeAllListeners('plcGetCpInfo_ret');
        Socket.removeAllListeners('plcGetOrderCode_ret');
        Socket.on('plcGetCpuInfo_ret', function(err, res){
            $scope.Catalog.unitInfo.ASName = res.ASName;
            $scope.Catalog.unitInfo.SerialNumber = res.SerialNumber;
            $scope.Catalog.unitInfo.ModuleTypeName = res.ModuleTypeName;
            $scope.Catalog.unitInfo.Copyright = res.Copyright;
            $scope.Catalog.unitInfo.ModuleName = res.ModuleName;
        });
        Socket.on('plcGetCpInfo_ret', function(err, res){
            $scope.Catalog.commInfo.MaxPduLengt = res.MaxPduLengt;
            $scope.Catalog.commInfo.MaxConnections = res.MaxConnections;
            $scope.Catalog.commInfo.MaxBusRate = res.MaxBusRate;
            $scope.Catalog.commInfo.MaxMpiRate = res.MaxMpiRate;
        });
        Socket.on('plcGetOrderCode_ret', function(err, res){
            $scope.Catalog.Code = res.Code;
            $scope.Catalog.V1 = res.V1;
            $scope.Catalog.V2 = res.V2;
            $scope.Catalog.V3 = res.V3;
        });
        $scope.setInfo = function(){
            Socket.emit('plcGetCpuInfo');
            Socket.emit('plcGetCpInfo');
            Socket.emit('plcGetOrderCode');
        };
        $scope.$watch('PLC.connected', function() {
            if($scope.PLC.connected){
                $scope.setInfo();
            }
        });
        Socket.emit('plcConnectionStatus');

    }
]);
