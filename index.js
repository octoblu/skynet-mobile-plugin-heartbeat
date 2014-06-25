var fitbit = require('./btle.js');

function Plugin(messenger, options, api) {
    this.name = require('./package.json').name;

    this.messenger = messenger;
    this.options = options;

    this.api = api; // Mobile Specific

    fitbit.init();

    return this;
}

var optionsSchema = {
    type: 'object',
    properties: {
        device : {
            type: 'string',
            required: true
        }
    }
};

var getDefaultOptions = function(callback){
    callback(null, {
        device : '' // TODO
    });
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
    //clean up
    this.api.logActivity({
        type: this.name,
        html: 'Destroying plugin'
    });

};

module.exports = {
    Plugin: Plugin, // Required
    optionsSchema: optionsSchema, // Optional
};