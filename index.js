var heartrate = require('./heartrate-btle.js');

function Plugin(messenger, options, api) {
    var self = this;

    self.name = require('./package.json').name;

    self.messenger = messenger;
    self.options = options;

    self.api = api; // Mobile Specific

    heartrate.init();

    $(document).on('heart-rate', function(e, hr){
        self.messenger.data({
            heartRate : hr
        });
        self.api.logActivity({
            type: self.name,
            html: 'Logged Heartbeat : ' + hr
        });
    });

    return self;
}

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
    Plugin: Plugin
};