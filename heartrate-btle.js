var btle = window.bluetoothle;
var config = {};

config.addressKey = 'heartbeat_address';

config.serviceUuid = '180d';
config.serviceUuids = [config.serviceUuid];
config.measurementCharacteristicUuid = '2a37';
config.clientCharacteristicConfigDescriptorUuid = '2902';
config.batteryServiceUuid = '180f';
config.batteryLevelCharacteristicUuid = '2a19';

config.debug = true;

function logIt(msg){
    if(!config.debug) return;
    console.log(msg);
}

var scanTimer = null;
var connectTimer = null;
var reconnectTimer = null;

var iOSPlatform = 'iOS';
var androidPlatform = 'Android';

function initializeSuccess(obj) {
    if (obj.status == 'initialized') {
        var address = window.localStorage.getItem(config.addressKey);
        if (address == null) {
            logIt('Bluetooth initialized successfully, starting scan for heart rate devices.');
            var paramsObj = {'serviceUuids': obj.serviceUuids};
            btle.startScan(startScanSuccess, startScanError, paramsObj);
        }
        else {
            connectDevice(address);
        }
    }
    else {
        logIt('Unexpected initialize status: ' + obj.status);
    }
}

function initializeError(obj) {
    logIt('Initialize error: ' + obj.error + ' - ' + obj.message);
}

function startScanSuccess(obj) {
    if (obj.status == 'scanResult') {
        logIt('Stopping scan..');
        btle.stopScan(stopScanSuccess, stopScanError);
        clearScanTimeout();

        window.localStorage.setItem(config.addressKey, obj.address);
        connectDevice(obj.address);
    }
    else if (obj.status == 'scanStarted') {
        logIt('Scan was started successfully, stopping in 10');
        scanTimer = setTimeout(scanTimeout, 10000);
    }
    else {
        logIt('Unexpected start scan status: ' + obj.status);
    }
}

function startScanError(obj) {
    logIt('Start scan error: ' + obj.error + ' - ' + obj.message);
}

function scanTimeout() {
    logIt('Scanning time out, stopping');
    btle.stopScan(stopScanSuccess, stopScanError);
}

function clearScanTimeout() {
    logIt('Clearing scanning timeout');
    if (scanTimer != null) {
        clearTimeout(scanTimer);
    }
}

function stopScanSuccess(obj) {
    if (obj.status == 'scanStopped') {
        logIt('Scan was stopped successfully');
    }
    else {
        logIt('Unexpected stop scan status: ' + obj.status);
    }
}

function stopScanError(obj) {
    logIt('Stop scan error: ' + obj.error + ' - ' + obj.message);
}

function connectDevice(address) {
    logIt('Begining connection to: ' + address + ' with 5 second timeout');
    var paramsObj = {'address': address};
    btle.connect(connectSuccess, connectError, paramsObj);
    connectTimer = setTimeout(connectTimeout, 5000);
}

function connectSuccess(obj) {
    if (obj.status == 'connected') {
        logIt('Connected to : ' + obj.name + ' - ' + obj.address);

        clearConnectTimeout();

        tempDisconnectDevice();
    }
    else if (obj.status == 'connecting') {
        logIt('Connecting to : ' + obj.name + ' - ' + obj.address);
    }
    else {
        logIt('Unexpected connect status: ' + obj.status);
        clearConnectTimeout();
    }
}

function connectError(obj) {
    logIt('Connect error: ' + obj.error + ' - ' + obj.message);
    clearConnectTimeout();
}

function connectTimeout() {
    logIt('Connection timed out');
}

function clearConnectTimeout() {
    logIt('Clearing connect timeout');
    if (connectTimer != null) {
        clearTimeout(connectTimer);
    }
}

function tempDisconnectDevice() {
    logIt('Disconnecting from device to test reconnect');
    btle.disconnect(tempDisconnectSuccess, tempDisconnectError);
}

function tempDisconnectSuccess(obj) {
    if (obj.status == 'disconnected') {
        logIt('Temp disconnect device and reconnecting in 1 second. Instantly reconnecting can cause issues');
        setTimeout(reconnect, 1000);
    }
    else if (obj.status == 'disconnecting') {
        logIt('Temp disconnecting device');
    }
    else {
        logIt('Unexpected temp disconnect status: ' + obj.status);
    }
}

function tempDisconnectError(obj) {
    logIt('Temp disconnect error: ' + obj.error + ' - ' + obj.message);
}

function reconnect() {
    logIt('Reconnecting with 5 second timeout');
    btle.reconnect(reconnectSuccess, reconnectError);
    reconnectTimer = setTimeout(reconnectTimeout, 5000);
}

function reconnectSuccess(obj) {
    if (obj.status == 'connected') {
        logIt('Reconnected to : ' + obj.name + ' - ' + obj.address);

        clearReconnectTimeout();

        if (window.device.platform == iOSPlatform) {
            logIt('Discovering heart rate service');
            var paramsObj = {'serviceUuids': [config.serviceUuid]};
            btle.services(servicesHeartSuccess, servicesHeartError, paramsObj);
        }
        else if (window.device.platform == androidPlatform) {
            logIt('Beginning discovery');
            btle.discover(discoverSuccess, discoverError);
        }
    }
    else if (obj.status == 'connecting') {
        logIt('Reconnecting to : ' + obj.name + ' - ' + obj.address);
    }
    else {
        logIt('Unexpected reconnect status: ' + obj.status);
        disconnectDevice();
    }
}

function reconnectError(obj) {
    logIt('Reconnect error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function reconnectTimeout() {
    logIt('Reconnection timed out');
}

function clearReconnectTimeout() {
    logIt('Clearing reconnect timeout');
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
                    logIt('Finding heart rate characteristics');
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
                logIt('Heart characteristics found, now discovering descriptor');
                var characteristicUuid = characteristicUuids[i];

                if (characteristicUuid == config.measurementCharacteristicUuid) {
                    var paramsObj = {'serviceUuid': config.serviceUuid, 'characteristicUuid': config.measurementCharacteristicUuid};
                    btle.descriptors(descriptorsHeartSuccess, descriptorsHeartError, paramsObj);
                    return;
                }
            }
        }
        logIt('Error: Heart rate measurement characteristic not found.');
    }
    else {
        logIt('Unexpected characteristics heart status: ' + obj.status);
    }
    disconnectDevice();
}

function characteristicsHeartError(obj) {
    logIt('Characteristics heart error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function descriptorsHeartSuccess(obj) {
    if (obj.status == 'discoveredDescriptors') {
        logIt('Discovered heart descriptors, now discovering battery service');
        var paramsObj = {'serviceUuids': [config.batteryServiceUuid]};
        btle.services(servicesBatterySuccess, servicesBatteryError, paramsObj);
    }
    else {
        logIt('Unexpected descriptors heart status: ' + obj.status);
        disconnectDevice();
    }
}

function descriptorsHeartError(obj) {
    logIt('Descriptors heart error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function servicesBatterySuccess(obj) {
    if (obj.status == 'discoveredServices') {
        var serviceUuids = config.serviceUuids;
        if(serviceUuids) {
            for (var i = 0; i < serviceUuids.length; i++) {
                var serviceUuid = serviceUuids[i];

                if (serviceUuid == config.batteryServiceUuid) {
                    logIt('Found battery service, now finding characteristic');
                    var paramsObj = {'serviceUuid': config.batteryServiceUuid, 'characteristicUuids': [config.batteryLevelCharacteristicUuid]};
                    btle.characteristics(characteristicsBatterySuccess, characteristicsBatteryError, paramsObj);
                    return;
                }
            }
        }
        logIt('Error: battery service not found');
    }
    else {
        logIt('Unexpected services battery status: ' + obj.status);
    }
    disconnectDevice();
}

function servicesBatteryError(obj) {
    logIt('Services battery error: ' + obj.error + ' - ' + obj.message);
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
        logIt('Error: Battery characteristic not found.');
    }
    else {
        logIt('Unexpected characteristics battery status: ' + obj.status);
    }
    disconnectDevice();
}

function characteristicsBatteryError(obj) {
    logIt('Characteristics battery error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function discoverSuccess(obj) {
    if (obj.status == 'discovered') {
        logIt('Discovery completed');

        readBatteryLevel();
    }
    else {
        logIt('Unexpected discover status: ' + obj.status);
        disconnectDevice();
    }
}

function discoverError(obj) {
    logIt('Discover error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function readBatteryLevel() {
    logIt('Reading battery level');
    var paramsObj = {'serviceUuid': config.batteryServiceUuid, 'characteristicUuid': config.batteryLevelCharacteristicUuid};
    btle.read(readSuccess, readError, paramsObj);
}

function readSuccess(obj) {
    if (obj.status == 'read') {
        var bytes = btle.encodedStringToBytes(obj.value);
        logIt('Battery level: ' + bytes[0]);

        logIt('Subscribing to heart rate for 5 seconds');
        var paramsObj = {'serviceUuid': config.serviceUuid, 'characteristicUuid': config.measurementCharacteristicUuid};
        btle.subscribe(subscribeSuccess, subscribeError, paramsObj);
        setTimeout(unsubscribeDevice, 5000);
    }
    else {
        logIt('Unexpected read status: ' + obj.status);
        disconnectDevice();
    }
}

function readError(obj) {
    logIt('Read error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function subscribeSuccess(obj) {
    if (obj.status == 'subscribedResult') {
        logIt('Subscription data received');

        //Parse array of int32 into uint8
        var bytes = btle.encodedStringToBytes(obj.value);

        //Check for data
        if (bytes.length == 0) {
            logIt('Subscription result had zero length data');
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
        logIt('Heart Rate: ' + hr);

        $(document).trigger('heart-rate', hr);
    }
    else if (obj.status == 'subscribed') {
        logIt('Subscription started');
    }
    else {
        logIt('Unexpected subscribe status: ' + obj.status);
        disconnectDevice();
    }
}

function subscribeError(msg) {
    logIt('Subscribe error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function unsubscribeDevice() {
    logIt('Unsubscribing heart service');
    var paramsObj = {'serviceUuid': config.serviceUuid, 'characteristicUuid': config.measurementCharacteristicUuid};
    btle.unsubscribe(unsubscribeSuccess, unsubscribeError, paramsObj);
}

function unsubscribeSuccess(obj) {
    if (obj.status == 'unsubscribed') {
        logIt('Unsubscribed device');

        logIt('Reading client configuration descriptor');
        var paramsObj = {'serviceUuid': config.serviceUuid, 'characteristicUuid': config.measurementCharacteristicUuid, 'descriptorUuid': config.clientCharacteristicConfigDescriptorUuid};
        btle.readDescriptor(readDescriptorSuccess, readDescriptorError, paramsObj);
    }
    else {
        logIt('Unexpected unsubscribe status: ' + obj.status);
        disconnectDevice();
    }
}

function unsubscribeError(obj) {
    logIt('Unsubscribe error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function readDescriptorSuccess(obj) {
    if (obj.status == 'readDescriptor') {
        var bytes = btle.encodedStringToBytes(obj.value);
        var u16Bytes = new Uint16Array(bytes.buffer);
        logIt('Read descriptor value: ' + u16Bytes[0]);
        disconnectDevice();
    }
    else {
        logIt('Unexpected read descriptor status: ' + obj.status);
        disconnectDevice();
    }
}

function readDescriptorError(obj) {
    logIt('Read Descriptor error: ' + obj.error + ' - ' + obj.message);
    disconnectDevice();
}

function disconnectDevice() {
    btle.disconnect(disconnectSuccess, disconnectError);
}

function disconnectSuccess(obj) {
    if (obj.status == 'disconnected') {
        logIt('Disconnect device');
        closeDevice();
    }
    else if (obj.status == 'disconnecting') {
        logIt('Disconnecting device');
    }
    else {
        logIt('Unexpected disconnect status: ' + obj.status);
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
        logIt('Closed device');
    }
    else {
        logIt('Unexpected close status: ' + obj.status);
    }
}

function closeError(obj) {
    logIt('Close error: ' + obj.error + ' - ' + obj.message);
}

module.exports = {

    config : function(newConfig){
        if(newConfig) config  = _.extend(config, newConfig);
    },
    
    init : function () {

        if(!btle){
            return logIt('BTLE Plugin not found :( ');
        }

        btle.initialize(initializeSuccess, initializeError);

    },

    destroy : function(){
        window.localStorage.removeItem(config.addressKey);
    }

};