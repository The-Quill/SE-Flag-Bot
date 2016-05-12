"use strict";

/* eslint-disable camelcase, no-process-env */
var loadedConfig;
try {
    require.resolve("../config.json");
    loadedConfig = require("../config.json");
} catch(e) {
    try {
        require.resolve("../config-SAMPLE.json");
        loadedConfig = require("../config-SAMPLE.json");
    } catch(e){
        console.error("Config is not found");
        process.exit(e.code);
    }
}
if (!loadedConfig) {
    throw new Error("No config file found");
}
if (!loadedConfig.hasOwnProperty("room_domains") || typeof loadedConfig.room_domains !== "object") {
    throw new Error("the loaded config files has incorrectly formatted or missing room domains");
}
if (!Object.keys(loadedConfig.room_domains).length > 0) {
    throw new Error("room config missing");
}
if (!loadedConfig.hasOwnProperty("default_se_to_login_into")) {
    throw new Error("No default SE site added.");
}
var config = {
    user: {},
    rooms: {}
};

config.debug = loadedConfig.debug || false;
config.acceptableUsers = loadedConfig.acceptableUsers || [];
config.blacklistedUsers = ['-99'].concat(loadedConfig.blacklistedUsers || []);

config.star_threshold = loadedConfig.star_threshold || 5;
config.default_se_to_login_into = loadedConfig.default_se_to_login_into;
if (!process.env.hasOwnProperty("REP_USER_EMAIL")) {
    throw new Error("Email config missing");
}
if (!process.env.hasOwnProperty("REP_USER_PASSWORD")) {
    throw new Error("password config missing");
}
config.user.email = process.env.REP_USER_EMAIL;
config.user.password = process.env.REP_USER_PASSWORD;

config.room_domains = loadedConfig.room_domains || {
    "StackExchange": {
        "rooms": {
            8595: {
                "name": "The 2nd Monitor",
                "room_id": 8595
            },
            6697: {
                "name": "Maid Cafe",
                "room_id": 6697
            },
            240: {
                "name": "The Nineteenth Byte",
                "room_id": 240
            }
        }
    },
    "MetaStackExchange": {
        "rooms": {
            89: {
                "name": "Tavern on the Meta",
                "room_id": 89
            }
        }
    },
    "StackOverflow": {
        "rooms": {
            17: {
                "name": "JavaScript",
                "room_id": 17
            },
            41570: {
                "name": "SO Close Vote Reviewers",
                "room_id": 41570
            }
        }
    }
};
module.exports = config;
