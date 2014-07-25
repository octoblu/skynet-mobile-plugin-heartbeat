var heartrate = require('./heartrate-btle.js');

function Plugin(messenger, options, api, deviceName) {
    var self = this;

    self.name = deviceName;

    self.messenger = messenger;
    self.options = options;

    self.api = api; // Mobile Specific

    var logIt = function(err, msg){
        var obj = {
            type: self.name
        };
        if(err){
            obj.error = err;
        }
        if(msg){
            obj.html = msg;
        }
        self.api.logActivity(obj);
    };

    if(!options.addressKey)
        options.addressKey = 'heart_' + self.name;

    heartrate.config(options, {
        logIt : logIt
    });

    heartrate.init();

    $(document).on('heart-rate', function(e, hr){
        self.messenger.data({
            device : self.name,
            type : 'heartRate',
            heartRate : hr
        });
        logIt(null, 'Logged Heartbeat : ' + hr);
    });

    return self;
}

function getDefaultOptions(cb){
    cb(null, {
        timeout : 60 * 60 * 1000
    });
}

var optionsSchema = {
    type: 'object',
    properties: {
        timeout: {
            type: 'integer',
            required: true
        }
    }
};

// Mobile Specific
Plugin.prototype.onEnable = function () {
    this.api.logActivity({
        type: this.name,
        html: 'Heartbeat plugin enabled'
    });
};

// Mobile Specific
Plugin.prototype.onDisable = function () {
    this.api.logActivity({
        type: this.name,
        html: 'Heartbeat plugin disabled'
    });
};

// Mobile Specific
Plugin.prototype.onInstall = function () {

    this.api.logActivity({
        type: this.name,
        html: 'Heartbeat plugin installed'
    });
};

Plugin.prototype.destroy = function () {
    heartrate.destroy();
};

module.exports = {
    Plugin: Plugin,
    optionsSchema : optionsSchema,
    getDefaultOptions : getDefaultOptions
};