/**
 * Created by efelo on 31.03.15.
 */
'use strict';

angular.module('client').controller('ClientDataRwController', ['Socket','$scope',
    function(Socket, $scope) {
        $scope.Buffer = {
            length: 256,
            rows: [{
                id: '',
                col: [{
                    val:''
                }]
            }
            ]

        };
        $scope.Area = {
            db: 1,
            start : 1,
            amount : 1,
            type: [
                {   value: 'S7AreaDB',
                    name: 'DB'},
                {   value: 'S7AreaPE',
                    name: 'Digital Inputs'},
                {   value: 'S7AreaPA',
                    name: 'Digital Outputs'},
                {   value: 'S7AreaMK',
                    name: 'Merker'},
                {   value: 'S7AreaTM',
                    name: 'Timers'},
                {   value: 'S7AreaCT',
                    name: 'Counters'}
            ],
            selType:'',
            length : [
                'S7WLBit',
                'S7WLByte',
                'S7WLWord',
                'S7WLDWord',
                'S7WLCounter',
                'S7WLTimer'
            ]
        };
        $scope.onData = function(err, data, execTime){
            var msgExecTime = '';
            if(execTime) msgExecTime = execTime + ' ms - ';
            data=data.data;
            if(err == null){
                if(data){
                    createBufferTable(data.length, data);
                }
                snap7log(msgExecTime + 'Data read/write OK', 'success');
            }else{
                snap7log(msgExecTime + err, 'danger');
            }
        };
        $scope.createBufferTable = function(data){
            $scope.Buffer.rows = [];
            var len =  $scope.Buffer.length;
            var maxRows = Math.ceil(len/16);
            for(var i=0; i<maxRows; i++){
                $scope.Buffer.rows.push({id:'0'+i+'0',col: []});
                var maxCols = 15;
                if((maxRows - 1) == i)
                    if((maxCols = (len % 16)-1) == -1)
                        maxCols = 15;
                for(var j=0; j<=maxCols; j++){
                    $scope.Buffer.rows[i].col.push({val: data && data[i*16+j] ? ('0'+data[i*16+j].toString(16).toUpperCase()).slice(-2) :'00'});
                }
            }
        };
        $scope.createBufferTable();
        Socket.removeAllListeners('readArea_ret');
        Socket.removeAllListeners('writeArea_ret');
        Socket.removeAllListeners('getRandomBuffer_ret');
        Socket.on('readArea_ret', $scope.onData);
        Socket.on('writeArea_ret', $scope.onData);
        Socket.on('getRandomBuffer_ret', $scope.onData);

        $scope.readDB = function(){
            var area = $scope.Area.selType;
            var DB = $scope.Area.db;
            var start = $scope.Area.start;
            var amount = $scope.Area.amount;
            var wordLen = $scope.Area.length;

            Socket.emit('readArea', {'area': +area, 'DB': +DB, 'start': +start, 'amount': +amount, 'wordLen': +wordLen});
        }
    }
]);
