'use strict';

const IOTA_PORT = 28081;

const http = require('http');
const qs = require('querystring');
const EventEmitter = require('events').EventEmitter;

var inherits = require('util').inherits;

var Characteristic, PlatformAccessory, Service, UUIDGen;

module.exports = function(homebridge) {
    PlatformAccessory = homebridge.platformAccessory;

    Characteristic = homebridge.hap.Characteristic;
    Service = homebridge.hap.Service;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerPlatform("homebridge-iota", "IoTa", IoTaPlatform, true);
};

function IoTaPlatform(log, config, api) {
    if (!config) {
        log.warn("Ignoring Iota Platform setup because it is not configured");
        this.disabled = true;
        return;
    }

    EventEmitter.call(this);

    this.api = api;
    this.config = config;
    this.accessories = {};
    this.log = log;
    
    this.requestServer = http.createServer(function(request, response) {
        if(request.method === "POST") {
            var data = "";

            request.on("data", function(chunk) {
                data += chunk;
            });

            request.on("end", function() {
                var device = qs.parse(data);
                this.emit('deviceEvent', device);
            }.bind(this));
        }
    }.bind(this));

    this.requestServer.listen(IOTA_PORT, function() {});
    
    this.api.on('didFinishLaunching', function() {});
    
    this.on('deviceEvent', function(device) {
        var service, characteristic, props;
        var accessory = this.accessories[UUIDGen.generate(device.uuid)];

        switch(device.service) {
            case 'OccupancySensor':
                service = Service.OccupancySensor;
                characteristic = Characteristic.OccupancyDetected;
                break;
            case 'StatelessProgrammableSwitch':
                service = Service.StatelessProgrammableSwitch;
                characteristic = Characteristic.ProgrammableSwitchEvent;
                props = {maxValue: Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS};
                break;
        }
        if (accessory === undefined) {
            accessory = this.addAccessory(device);
        }

        accessory.updateReachability(true);

        if (accessory.getService(service) === undefined) {
            accessory.addService(service, this.getName(device));

            if (props != undefined) {
                accessory.getService(service)
                    .getCharacteristic(characteristic)
                    .setProps(props);
            }
        }

        accessory.getService(service)
            .getCharacteristic(characteristic)
            .setValue(parseInt(device.state));
            
        switch(device.service) {
            case 'OccupancySensor':
                this.log("%s - Occupancy: %s", device.name, (parseInt(device.state) ? "Detected" : "Not Detected"));
                break;
            case 'StatelessProgrammableSwitch':
                this.log("%s - Button: Pressed", device.name);
                break;
        }
    }.bind(this));
}
inherits(IoTaPlatform, EventEmitter);

IoTaPlatform.prototype.addAccessory = function(device) {
    var name =  this.getName(device);
    var accessory = new PlatformAccessory(name, UUIDGen.generate(device.uuid));

    this.log("Found: %s [%s]", name, device.uuid);

    accessory.getService(Service.AccessoryInformation)
        .setCharacteristic(Characteristic.Manufacturer, "IoTa Labs")
        .setCharacteristic(Characteristic.Model, "Dot")

    this.accessories[accessory.UUID] = accessory;
    this.api.registerPlatformAccessories("homebridge-iota", "IoTa", [accessory]);

    return accessory;
}

IoTaPlatform.prototype.configureAccessory = function(accessory) {
    this.accessories[accessory.UUID] = accessory;
}

IoTaPlatform.prototype.configurationRequestHandler = function(context, request, callback) {
    var self = this;
    var respDict = {};

    if (request && request.type === "Terminate") {
        context.onScreen = null;
    }

    var sortAccessories = function() {
        context.sortedAccessories = Object.keys(self.accessories).map(
            function(k){return this[k]},
            self.accessories
        ).sort(function(a,b) {if (a.displayName < b.displayName) return -1; if (a.displayName > b.displayName) return 1; return 0});

        return Object.keys(context.sortedAccessories).map(function(k) {return this[k].displayName}, context.sortedAccessories);
    }

    switch(context.onScreen) {
        case "DoRemove":
            if (request.response.selections) {
                for (var i in request.response.selections.sort()) {
                    this.removeAccessory(context.sortedAccessories[request.response.selections[i]]);
                }

                respDict = {
                    "type": "Interface",
                    "interface": "instruction",
                    "title": "Finished",
                    "detail": "Accessory removal was successful."
                }

                context.onScreen = null;
                callback(respDict);
            }
            else {
                context.onScreen = null;
                callback(respDict, "platform", true, this.config);
            }
            break;
        case "Menu":
            context.onScreen = "Remove";

            switch(context.onScreen) {
                case "Modify":
                case "Remove":
                    respDict = {
                        "type": "Interface",
                        "interface": "list",
                        "title": "Select accessory to " + context.onScreen.toLowerCase(),
                        "allowMultipleSelection": context.onScreen == "Remove",
                        "items": sortAccessories()
                    }

                    context.onScreen = "Do" + context.onScreen;
                    break;
            }

            callback(respDict);
            break;
        default:
            if (request && (request.response || request.type === "Terminate")) {
                context.onScreen = null;
                callback(respDict, "platform", true, this.config);
            }
            else {
                respDict = {
                    "type": "Interface",
                    "interface": "list",
                    "title": "Select option",
                    "allowMultipleSelection": false,
                    "items": ["Remove Accessory"]
                }

                context.onScreen = "Menu";
                callback(respDict);
            }
    }
}

IoTaPlatform.prototype.getName = function(device) {
    return device.name + " Dot" || "Dot";
}

IoTaPlatform.prototype.removeAccessory = function(accessory) {
    this.log("Remove: %s", accessory.UUID);

    if (this.accessories[accessory.UUID]) {
        delete this.accessories[accessory.UUID];
    }

    this.api.unregisterPlatformAccessories("homebridge-iota", "iota", [accessory]);
}
