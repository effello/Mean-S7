/**
 * Created by efelo on 30.03.15.
 */
'use strict';

// Configuring the core module
angular.module('core').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Client', 'client', 'dropdown', '/client');
        Menus.addSubMenuItem('topbar', 'client', 'Scan Devices', 'client/scan');
        Menus.addSubMenuItem('topbar', 'client', 'System Info', 'client/systemInfo');
        Menus.addSubMenuItem('topbar', 'client', 'Data Read/Write', 'client/dataRw');
    }
]);
