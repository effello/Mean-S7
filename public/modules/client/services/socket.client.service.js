/**
 * Created by efelo on 29.03.15.
 */
'use strict';

//socket factory that provides the socket service
angular.module('client').factory('Socket', ['socketFactory',
    function(socketFactory) {
        return socketFactory({
            prefix: '',
            ioSocket: io.connect('http://localhost:3000')
        });
    }
]);
