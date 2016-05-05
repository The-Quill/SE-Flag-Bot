"use strict";
var config = require("./config");

var ITEMS = {
    messages: {},
    stars: {},
    flags: {},
    lastEvent: {}
};
var noFormattingLinked = function() {
    throw new Error("There is no formatting linked.");
};
var blacklistedUsers = config.blacklistedUsers;

var messageFormatting = {
    room: noFormattingLinked,
    user: noFormattingLinked,
    activity: noFormattingLinked,
    content: noFormattingLinked,
    edited: noFormattingLinked,
    messageId: noFormattingLinked,
    connection: noFormattingLinked
};
var say = function(){};
var reply = function(){};
var commands = {};
var limitedAccessCommands = {};

var set = {
    messageFormatting: function(value) {
        messageFormatting = value;
    },
    say: function(value){
        say = value;
    },
    reply: function(value){
        reply = value;
    },
    commands: function(value){
        commands = value;
    },
    limitedAccessCommands: function(value){
        limitedAccessCommands = value;
    }
};
var EVENT_TYPES = {
    MessagePosted: 1,
    MessageEdited: 2,
    UserEntered: 3,
    UserLeft: 4,
    RoomNameChanged: 5,
    MessageStarred: 6,
    UserMentioned: 8,
    MessageFlagged: 9,
    MessageDeleted: 10,
    UserNotification: 16,
    Invitation: 17,
    MessageReply: 18,
    MessageMovedOut: 19,
    MessageMovedIn: 20
};

var convert = function(str) {
    return !str ? "" // eslint-disable-line no-negated-condition
    : str.replace(/&amp;/g, "&")
         .replace(/&gt;/g, ">")
         .replace(/&lt;/g, "<")
         .replace(/&quot;/g, "\"")
         .replace(/&#39;/g, "'");
};

var processCommand = function(event){
    if (event.room_id != 39270){
        return;
    }
    if (!event.content.startsWith("@Marvin ") && !event.content.startsWith("!!/")){
        return;
    }
    if (config.blacklistedUsers.indexOf(String(event.user_id)) !== -1){
        reply("You're not allowed to do that", event);
        return;
    }
    var commandArguments = event.content
        .replace("@Marvin ", "")
        .replace("!!/", "")
        .split(" ");
    var commandName = commandArguments[0];
    var command = commands[commandName];
    var commandArgs = commandArguments.slice(1);
    if (limitedAccessCommands.hasOwnProperty(commandName)
     && config.acceptableUsers.indexOf(String(event.user_id)) === -1){
        say("You're not allowed to do that.");
        return;
    }
    if (commands.hasOwnProperty(commandName)){
        switch (commandName){
            case "delete":
            case "join":
            case "leave":
                say(command("SE", commandArgs));
                break;
            case "restart":
            case "stop":
            case "pull":
                command(say, commandArgs);
                break;
            case "blacklist":
                if (blacklistedUsers.indexOf(commandArgs[0]) > -1){
                    reply("They're already blacklisted.", event);
                }
                blacklistedUsers.push(commandArgs[0]);
                command(commandArgs);
                break;
            case "removeBlacklist":
                if (blacklistedUsers.indexOf(commandArgs[0]) === -1){
                    reply("They're not blacklisted.", event);
                }
                blacklistedUsers.splice(blacklistedUsers.indexOf(commandArgs[0]), 1);
                command(commandArgs);
                break;
            case "alive":
            case "rampDownTheSarcasm":
            case "rampUpTheSarcasm":
            case "help":
                reply(
                    command(commandArgs),
                    event
                );
                break;
            case "listCommands":
                reply(
                    command(config.acceptableUsers.indexOf(String(event.user_id)) !== -1, commandArgs),
                    event
                );
                break;
            default:
                say(command(commandArgs))
                break;
        }
    } else {
        say("Command " + commandName + " not recognised.")
    }
}

/* eslint-disable complexity, max-statements */
var processEvent = function(event) {
    if (event.content === ITEMS.lastEventContent) {
        return false;
    }
    ITEMS.lastEventContent = event.content;
    event.content = convert(event.content);
    switch (event.event_type) {
        case EVENT_TYPES.MessagePosted:
            processCommand(event);
            break;
        case EVENT_TYPES.MessageEdited:
            processCommand(event);
            break;
        case EVENT_TYPES.MessageStarred:
            if (!event.message_stars) {
                delete ITEMS.stars[event.message_id];
                return;
            }
            if (ITEMS.stars.hasOwnProperty(event.message_id)){
                return;
            }
            if (event.message_stars > config.star_threshold) {
                ITEMS.stars[event.message_id] = event.message_stars;
                say(
                    messageFormatting.room(event) +
                    messageFormatting.activity(" highly starred [message](http://chat.stackexchange.com/transcript/message/" + event.message_id + "#" + event.message_id + ") with ") +
                    event.message_stars +
                    " stars."
                );
            }
            break;
        case EVENT_TYPES.MessageFlagged:
            if (!ITEMS.flags.hasOwnProperty(event.message_id)){
                ITEMS.flags[event.message_id] = event;
                say(
                    messageFormatting.activity("A [message](http://chat.stackexchange.com/transcript/message/" + event.id + "#" + event.id + ") in ") +
                    messageFormatting.room(event) +
                    messageFormatting.activity(" was flagged.")
                );
                // Uncomment the line below to turn on sharing of the message
                //say(messageFormatting.content(event));
            }
            break;
    }
};
module.exports = {
    processEvent: processEvent,
    convert: convert,
    set: set,
    ITEMS: ITEMS,
    EVENT_TYPES: EVENT_TYPES
};
