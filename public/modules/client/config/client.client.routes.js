'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider
            .state('client', {
                url: '/client',
                templateUrl: 'modules/client/views/index-client.client.view.html'
            })
            .state('client.scanDevices', {
                url: '/scan',
                templateUrl: 'modules/client/views/scan-client.client.view.html'
            })
            .state('client.systemInfo', {
                url: '/systemInfo',
                templateUrl: 'modules/client/views/info-client.client.view.html'
            })
            .state('client.dataRw', {
                url: '/dataRw',
                templateUrl: 'modules/client/views/dataRw-client.client.view.html'
            });
    }

]);
