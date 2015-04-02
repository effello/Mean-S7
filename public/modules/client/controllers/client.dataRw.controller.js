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
                {   value: 132,
                    name: 'DB'},
                {   value: 129,
                    name: 'Digital Inputs'},
                {   value: 130,
                    name: 'Digital Outputs'},
                {   value: 131,
                    name: 'Merker'},
                {   value: 29,
                    name: 'Timers'},
                {   value: 28,
                    name: 'Counters'}
            ],
            selType:132,
            length : [
                {   value: 1,
                    name: 'S7WLBit'},
                {   value: 2,
                    name: 'S7WLByte'},
                {   value: 4,
                    name: 'S7WLWord'},
                {   value: 8,
                    name: 'S7WLDWord'},
                {   value: 22,
                    name: 'S7WLCounter'},
                {   value: 29,
                    name: 'S7WLTimer'}
            ],
            selLength: 2
        };
        $scope.onData = function(err, data, execTime){
            var msgExecTime = '';
            if(execTime) msgExecTime = execTime + ' ms - ';
            data=data.data;
            if(err == null){
                if(data){
                    $scope.createBufferTable(data,data.length);
                }
                $scope.snap7log(msgExecTime + 'Data read/write OK', 'success');
            }else{
                $scope.snap7log(msgExecTime + err, 'danger');
            }
        };
        $scope.createBufferTable = function(data, len){
            $scope.Buffer.rows = [];
            var length =0;
            if(!len)
                length =  $scope.Buffer.length;
            else
                length = len;
            var maxRows = Math.ceil(length/16);
            for(var i=0; i<maxRows; i++){
                $scope.Buffer.rows.push({id:'0'+i+'0',col: []});
                var maxCols = 15;
                if((maxRows - 1) == i)
                    if((maxCols = (length % 16)-1) == -1)
                        maxCols = 15;
                for(var j=0; j<=maxCols; j++){
                    $scope.Buffer.rows[i].col.push({val: data && data[i*16+j] ? ('0'+data[i*16+j].toString(16).toUpperCase()).slice(-2) :'00'});
                }
            }
        };
        $scope.writeSuccess = function(err){
            if(!err){
                $scope.readDB();
            }
        };
        $scope.createBufferTable();
        Socket.removeAllListeners('readArea_ret');
        Socket.removeAllListeners('writeArea_ret');
        Socket.removeAllListeners('getRandomBuffer_ret');
        Socket.on('readArea_ret', $scope.onData);
        Socket.on('writeArea_ret', $scope.writeSuccess);
        Socket.on('getRandomBuffer_ret', $scope.onData);

        $scope.readDB = function(){
            var area = $scope.Area.selType;
            var DB = $scope.Area.db;
            var start = $scope.Area.start;
            var amount = $scope.Area.amount;
            var wordLen = $scope.Area.selLength;

            Socket.emit('readArea', {'area': +area, 'DB': +DB, 'start': +start, 'amount': +amount, 'wordLen': +wordLen});
        };
        $scope.writeDB = function(){
            var area = $scope.Area.selType;
            var DB = $scope.Area.db;
            var start = $scope.Area.start;
            var amount = $scope.Area.amount;
            var wordLen = $scope.Area.selLength;
            var buffer = [];

            for(var i=0; i<(wordLen*amount/16); i++){
                for(var j=0; j<(wordLen*amount/2);j++){
                    buffer.push(parseInt($scope.Buffer.rows[i].col[j].val, 16));
                }

            }
            Socket.emit('writeArea', {'area': +area, 'DB': +DB, 'start': +start, 'amount': +amount, 'wordLen': +wordLen, 'buffer': buffer});

        }
    }
]);
