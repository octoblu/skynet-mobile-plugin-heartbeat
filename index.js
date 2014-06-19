function Plugin(messenger, options, api) {
    this.name = 'skynet-mobile-plugin-fitbit';

    this.messenger = messenger;
    this.options = options;

    this.api = api; // Mobile Specific

    return this;
}

var optionsSchema = {
    type: 'object',
    properties: {
        fitbitName : {
            type: 'string',
            required: true
        }
    }
};

var messageSchema = {
    type: 'object',
    properties: {
        text: {
            type: 'string',
            required: true
        }
    }
};

// Mobile Specific
Plugin.prototype.onEnable = function () {
    this.api.logActivity({
        type: this.name,
        html: 'Fitbit plugin enabled'
    });
};

// Mobile Specific
Plugin.prototype.onDisable = function () {
    this.api.logActivity({
        type: this.name,
        html: 'Fitbit plugin disabled'
    });
};

// Mobile Specific
Plugin.prototype.onInstall = function () {
    this.api.logActivity({
        type: this.name,
        html: 'Fitbit plugin installed'
    });
};

Plugin.prototype.destroy = function () {
    //clean up
    this.api.logActivity({
        type: this.name,
        html: 'Destroying plugin'
    });

};