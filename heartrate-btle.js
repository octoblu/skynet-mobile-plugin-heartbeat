var btle = window.bluetoothle;
var config = {};

config.addressKey = 'heartbeat_address';

config.serviceUuid = '180d';
config.serviceUuids = [config.serviceUuid];
config.measurementCharacteristicUuid = '2a37';
config.clientCharacteristicConfigDescriptorUuid = '2902';
config.batteryServiceUuid = '180f';
config.batteryLevelCharacteristicUuid = '2a19';
config.batteryServiceUuids = [config.batteryServiceUuid];

config.timeout = 60 * 60 * 1000;

config.debug = true;

var consoleLog = function(msg){
    if(!config.debug) return;
    console.log(msg);
};

var logIt = function(){};

var scanTimer = null;
var connectTimer = null;
var reconnectTimer = null;

var iOSPlatform = 'iOS';
var androidPlatform = 'Android';

function initializeSuccess(obj) {
    if (obj.status == 'initialized') {
        var address = window.localStorage.getItem(config.addressKey);
        if (address == null) {
            consoleLog('Bluetooth initialized successfully, starting scan for heart rate devices.');
            var paramsObj = {'serviceUuids': obj.serviceUuids};
            btle.startScan(startScanSuccess, startScanError, paramsObj);
        }
        else {
            connectDevice(address);
        }
    }
    else {
        consoleLog('Unexpected initialize status: ' + obj.status);
    }
}

function initializeError(obj) {
    logIt('Initialize error: ' + obj.error + ' - ' + obj.message);
}

function startScanSuccess(obj) {
    if (obj.status == 'scanResult') {
        consoleLog('Stopping scan..');
        btle.stopScan(stopScanSuccess, stopScanError);
        clearScanTimeout();

        window.localStorage.setItem(config.addressKey, obj.address);
        connectDevice(obj.address);
    }
    else if (obj.status == 'scanStarted') {
        consoleLog('Scan was started successfully, stopping in 20 seconds');
        scanTimer = setTimeout(scanTimeout, 20000);
    }
    else {
        consoleLog('Unexpected start scan status: ' + obj.status);
    }
}

function startScanError(obj) {
    consoleLog('Start scan error: ' + obj.error + ' - ' + obj.message);
}

function scanTimeout() {
    consoleLog('Scanning time out, stopping');
    btle.stopScan(stopScanSuccess, stopScanError);
}

function clearScanTimeout() {
    consoleLog('Clearing scanning timeout');
    if (scanTimer != null) {
        clearTimeout(scanTimer);
    }
}

function stopScanSuccess(obj) {
    if (obj.status == 'scanStopped') {
        consoleLog('Scan was stopped successfully');
    }
    else {
        consoleLog('Unexpected stop scan status: ' + obj.status);
    }
}

function stopScanError(obj) {
    consoleLog('Stop scan error: ' + obj.error + ' - ' + obj.message);
}

function connectDevice(address) {
    consoleLog('Begining connection to: ' + address + ' with ' + config.timeout + ' second timeout');
    var paramsObj = {'address': address};
    btle.connect(connectSuccess, connectError, paramsObj);
    connectTimer = setTimeout(connectTimeout, config.timeout);
}

function connectSuccess(obj) {
    if (obj.status == 'connected') {
        logIt(null, 'Connected to : ' + obj.name + ' - ' + obj.address);

        clearConnectTimeout();

        tempDisconnectDevice();
    }
    else if (obj.status == 'connecting') {
        consoleLog('Connecting to : ' + obj.name + ' - ' + obj.address);
    }
    else {
        consoleLog('Unexpected connect status: ' + obj.status);
        clearConnectTimeout();
    }
}

function connectError(obj) {
    consoleLog('Connect error: ' + obj.error + ' - ' + obj.message);
    clearConnectTimeout();
    if(obj.error === 'connect'){
        reconnect();
    }
}

function connectTimeout() {
    consoleLog('Connection timed out');
}

function clearConnectTimeout() {
    consoleLog('Clearing connect timeout');
    if (connectTimer != null) {
        clearTimeout(connectTimer);
    }
}

function tempDisconnectDevice() {
    consoleLog('Disconnecting from device to test reconnect');
    btle.disconnect(tempDisconnectSuccess, tempDisconnectError);
}

function tempDisconnectSuccess(obj) {
    if (obj.status == 'disconnected') {
        consoleLog('Temp disconnect device and reconnecting in 1 second. Instantly reconnecting can cause issues');
        setTimeout(reconnect, 3000);
    }
    else if (obj.status == 'disconnecting') {
        consoleLog('Temp disconnecting device');
    }
    else {
        consoleLog('Unexpected temp disconnect status: ' + obj.status);
    }
}

function tempDisconnectError(obj) {
    consoleLog('Temp disconnect error: ' + obj.error + ' - ' + obj.message);
}

function reconnect() {
    consoleLog('Reconnecting with 5 second timeout');
    btle.reconnect(reconnectSuccess, reconnectError);
    reconnectTimer = setTimeout(reconnectTimeout, 5000);
}

function reconnectSuccess(obj) {
    if (obj.status == 'connected') {
        logIt(null, 'Reconnected to : ' + obj.name + ' - ' + obj.address);

        clearReconnectTimeout();

        if (window.device.platform == iOSPlatform) {
            logIt(null, 'Discovering heart rate service');
            var paramsObj = {'serviceUuids': config.serviceUuids};
            btle.services(servicesHeartSuccess, servicesHeartError, paramsObj);
        }
        else if (window.device.platform == androidPlatform) {
            consoleLog('Beginning discovery');
            btle.discover(discoverSuccess, discoverError);
        }
    }
    else if (obj.status == 'connecting') {
        consoleLog('Reconnecting to : ' + obj.name + ' - ' + obj.address);
    }
    else {
        consoleLog('Unexpected reconnect status: ' + obj.status);
        disconnectDevice();
    }
}

function reconnectError(obj) {
    consoleLog('Reconnect error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function reconnectTimeout() {
    consoleLog('Reconnection timed out');
}

function clearReconnectTimeout() {
    consoleLog('Clearing reconnect timeout');
    if (reconnectTimer != null) {
        clearTimeout(reconnectTimer);
    }
}

function servicesHeartSuccess(obj) {
    if (obj.status == 'discoveredServices') {
        var serviceUuids = config.serviceUuids;
        if(serviceUuids) {
            for (var i = 0; i < serviceUuids.length; i++) {
                var serviceUuid = serviceUuids[i];

                if (serviceUuid == config.serviceUuid) {
                    consoleLog('Finding heart rate characteristics');
                    var paramsObj = {'serviceUuid': config.serviceUuid, 'characteristicUuids': [config.measurementCharacteristicUuid]};
                    btle.characteristics(characteristicsHeartSuccess, characteristicsHeartError, paramsObj);
                    return;
                }
            }
        }
        logIt('Error: heart rate service not found');
    }
    else {
        logIt('Unexpected services heart status: ' + obj.status);
    }
    disconnectDevice();
}

function servicesHeartError(obj) {
    logIt('Services heart error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function characteristicsHeartSuccess(obj) {
    if (obj.status == 'discoveredCharacteristics') {
        var characteristicUuids = obj.characteristicUuids;
        if(characteristicUuids) {
            for (var i = 0; i < characteristicUuids.length; i++) {
                consoleLog('Heart characteristics found, now discovering descriptor');
                var characteristicUuid = characteristicUuids[i];

                if (characteristicUuid == config.measurementCharacteristicUuid) {
                    var paramsObj = {'serviceUuid': config.serviceUuid, 'characteristicUuid': config.measurementCharacteristicUuid};
                    btle.descriptors(descriptorsHeartSuccess, descriptorsHeartError, paramsObj);
                    return;
                }
            }
        }
        consoleLog('Error: Heart rate measurement characteristic not found.');
    }
    else {
        consoleLog('Unexpected characteristics heart status: ' + obj.status);
    }
    disconnectDevice();
}

function characteristicsHeartError(obj) {
    consoleLog('Characteristics heart error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function descriptorsHeartSuccess(obj) {
    if (obj.status == 'discoveredDescriptors') {
        consoleLog('Discovered heart descriptors, now discovering battery service');
        var paramsObj = {'serviceUuids': config.batteryServiceUuids};
        btle.services(servicesBatterySuccess, servicesBatteryError, paramsObj);
    }
    else {
        consoleLog('Unexpected descriptors heart status: ' + obj.status);
        disconnectDevice();
    }
}

function descriptorsHeartError(obj) {
    consoleLog('Descriptors heart error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function servicesBatterySuccess(obj) {
    if (obj.status == 'discoveredServices') {
        var serviceUuids = config.batteryServiceUuids;
        if(serviceUuids) {
            for (var i = 0; i < serviceUuids.length; i++) {
                var serviceUuid = serviceUuids[i];

                if (serviceUuid == config.batteryServiceUuid) {
                    consoleLog('Found battery service, now finding characteristic');
                    var paramsObj = {'serviceUuid': config.batteryServiceUuid, 'characteristicUuids': [config.batteryLevelCharacteristicUuid]};
                    btle.characteristics(characteristicsBatterySuccess, characteristicsBatteryError, paramsObj);
                    return;
                }
            }
        }
        consoleLog('Error: battery service not found');
    }
    else {
        consoleLog('Unexpected services battery status: ' + obj.status);
    }
    disconnectDevice();
}

function servicesBatteryError(obj) {
    consoleLog('Services battery error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function characteristicsBatterySuccess(obj) {
    if (obj.status == 'discoveredCharacteristics') {
        var characteristicUuids = obj.characteristicUuids;
        if(characteristicUuids) {
            for (var i = 0; i < characteristicUuids.length; i++) {
                var characteristicUuid = characteristicUuids[i];

                if (characteristicUuid == config.batteryLevelCharacteristicUuid) {
                    readBatteryLevel();
                    return;
                }
            }
        }
        consoleLog('Error: Battery characteristic not found.');
    }
    else {
        consoleLog('Unexpected characteristics battery status: ' + obj.status);
    }
    disconnectDevice();
}

function characteristicsBatteryError(obj) {
    consoleLog('Characteristics battery error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function discoverSuccess(obj) {
    if (obj.status == 'discovered') {
        consoleLog('Discovery completed');

        readBatteryLevel();
    }
    else {
        consoleLog('Unexpected discover status: ' + obj.status);
        disconnectDevice();
    }
}

function discoverError(obj) {
    consoleLog('Discover error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function readBatteryLevel() {
    consoleLog('Reading battery level');
    var paramsObj = {'serviceUuid': config.batteryServiceUuid, 'characteristicUuid': config.batteryLevelCharacteristicUuid};
    btle.read(readSuccess, readError, paramsObj);
}

function readSuccess(obj) {
    if (obj.status == 'read') {
        var bytes = btle.encodedStringToBytes(obj.value);
        logIt(null, 'Battery level: ' + bytes[0]);

        consoleLog('Subscribing to heart rate for ' + config.timeout + ' seconds');
        var paramsObj = {'serviceUuid': config.serviceUuid, 'characteristicUuid': config.measurementCharacteristicUuid};
        btle.subscribe(subscribeSuccess, subscribeError, paramsObj);
        setTimeout(unsubscribeDevice, config.timeout);
    }
    else {
        consoleLog('Unexpected read status: ' + obj.status);
        disconnectDevice();
    }
}

function readError(obj) {
    logIt('Read error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function subscribeSuccess(obj) {
    if (obj.status == 'subscribedResult') {
        consoleLog('Subscription data received');

        //Parse array of int32 into uint8
        var bytes = btle.encodedStringToBytes(obj.value);

        //Check for data
        if (bytes.length == 0) {
            consoleLog('Subscription result had zero length data');
            return;
        }

        //Get the first byte that contains flags
        var flag = bytes[0];

        //Check if u8 or u16 and get heart rate
        var hr;
        if ((flag & 0x01) == 1) {
            var u16bytes = bytes.buffer.slice(1, 3);
            var u16 = new Uint16Array(u16bytes)[0];
            hr = u16;
        }
        else {
            var u8bytes = bytes.buffer.slice(1, 2);
            var u8 = new Uint8Array(u8bytes)[0];
            hr = u8;
        }
        consoleLog('Heart Rate: ' + hr);

        $(document).trigger('heart-rate', hr);
    }
    else if (obj.status == 'subscribed') {
        consoleLog('Subscription started');
    }
    else {
        consoleLog('Unexpected subscribe status: ' + obj.status);
        disconnectDevice();
    }
}

function subscribeError(msg) {
    logIt('Subscribe error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function unsubscribeDevice() {
    consoleLog('Unsubscribing heart service');
    var paramsObj = {'serviceUuid': config.serviceUuid, 'characteristicUuid': config.measurementCharacteristicUuid};
    btle.unsubscribe(unsubscribeSuccess, unsubscribeError, paramsObj);
}

function unsubscribeSuccess(obj) {
    if (obj.status == 'unsubscribed') {
        consoleLog('Unsubscribed device');

        consoleLog('Reading client configuration descriptor');
        var paramsObj = {'serviceUuid': config.serviceUuid, 'characteristicUuid': config.measurementCharacteristicUuid, 'descriptorUuid': config.clientCharacteristicConfigDescriptorUuid};
        btle.readDescriptor(readDescriptorSuccess, readDescriptorError, paramsObj);
    }
    else {
        consoleLog('Unexpected unsubscribe status: ' + obj.status);
        disconnectDevice();
    }
}

function unsubscribeError(obj) {
    consoleLog('Unsubscribe error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function readDescriptorSuccess(obj) {
    if (obj.status == 'readDescriptor') {
        var bytes = btle.encodedStringToBytes(obj.value);
        var u16Bytes = new Uint16Array(bytes.buffer);
        consoleLog('Read descriptor value: ' + u16Bytes[0]);
        disconnectDevice();
    }
    else {
        consoleLog('Unexpected read descriptor status: ' + obj.status);
        disconnectDevice();
    }
}

function readDescriptorError(obj) {
    consoleLog('Read Descriptor error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function disconnectDevice() {
    btle.disconnect(disconnectSuccess, disconnectError);
}

function disconnectSuccess(obj) {
    if (obj.status == 'disconnected') {
        logIt(null, 'Disconnect device');
        closeDevice();
    }
    else if (obj.status == 'disconnecting') {
        consoleLog('Disconnecting device');
    }
    else {
        consoleLog('Unexpected disconnect status: ' + obj.status);
    }
}

function disconnectError(obj) {
    logIt('Disconnect error: ' + obj.error + ' - ' + obj.message);
}

function closeDevice() {
    btle.close(closeSuccess, closeError);
}

function closeSuccess(obj) {
    if (obj.status == 'closed') {
        consoleLog('Closed device');
    }
    else {
        consoleLog('Unexpected close status: ' + obj.status);
    }
}

function closeError(obj) {
    logIt('Close error: ' + obj.error + ' - ' + obj.message);
}

module.exports = {

    config : function(newConfig, api){
        if(newConfig) config  = _.extend(config, newConfig);

        if(api.logIt) logIt = api.logIt;

    },
    
    init : function () {

        if(!btle){
            return consoleLog('BTLE Plugin not found :( ');
        }

        btle.initialize(initializeSuccess, initializeError);

    },

    destroy : function(){
        window.localStorage.removeItem(config.addressKey);
    }

};