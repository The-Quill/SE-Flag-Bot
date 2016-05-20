"use strict";
var config = require("./config");

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

var ITEMS = {
    messages: {},
    stars: {},
    flags: {},
    lastEvent: {}
};
var noFormattingLinked = function() {
    throw new Error("There is no formatting linked.");
};
var blacklistedUsers = config.blacklistedUsers || [];
var acceptableUsers = config.acceptableUsers || [];

acceptableUsers = acceptableUsers.concat([
    //ID here with //comment with your name
    '145604', // Quill SE
    '24697', // PhiNotPi SE
    '175356', // Downgoat SE
    '116494' // Conor O Brien SE
    '315433' // sandwich MSE
    '237813' // bjb MSE
]);
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
var specialSay = function(){};
var noPrefixSay = function(){};
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
    specialSay: function(value){
        specialSay = value;
    },
    noPrefixSay: function(value){
        noPrefixSay = value;
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
    if (String(event.room_id) != "39270" && String(event.room_id) != "89"){
        return false;
    }
    if (!event.content.startsWith("@Marvin ") && !event.content.startsWith("!!/")){
        return false;
    }
    if ((event.content.startsWith("@Marvin") || event.content.startsWith("!!/")) && String(event.room_id) == "89"){
        return false;
    }
    if (String(event.room_id) != "89" && event.content.startsWith("@Quill")){
        return false;
    }
    if (blacklistedUsers.indexOf(String(event.user_id)) !== -1){
        return reply("I can't let you do that.", event);
    }
    var commandArguments = event.content
        .replace("@Marvin ", "")
        .replace("@Quill ", "")
        .replace("!!/", "")
        .split(" ");
    var commandName = commandArguments[0];
    if (commandName == ''){
        return reply("You need to actually type a command...");
    }
    var command = commands[commandName];
    var commandArgs = commandArguments.slice(1);
    if (limitedAccessCommands.hasOwnProperty(commandName) && acceptableUsers.indexOf(String(event.user_id)) === -1)){
        if (event.domain == "SE"){
            return reply("I can't let you do that.", event);
        }
    }
    var speaker = (event.domain == "SE" ? say : specialSay);
    if (commands.hasOwnProperty(commandName)){
        switch (commandName){
            case "delete":
            case "join":
            case "leave":
                return say(command("SE", commandArgs));
                break;
            case "restart":
            case "stop":
            case "pull":
                return speaker(say, commandArgs);
                break;
            case "blacklist":
                if (blacklistedUsers.indexOf(commandArgs[0]) > -1){
                    return reply("They're already blacklisted.", event);
                }
                if (acceptableUsers.indexOf(String(commandArgs[0])) !== -1){
                    return reply("They're a special user... don't even try it, sassy pants.", event)
                }
                blacklistedUsers.push(commandArgs[0]);
                return command(commandArgs);
                break;
            case "removeBlacklist":
                if (blacklistedUsers.indexOf(commandArgs[0]) === -1){
                    reply("They're not blacklisted.", event);
                }
                blacklistedUsers.splice(blacklistedUsers.indexOf(commandArgs[0]), 1);
                return command(commandArgs);
                break;
            case "alive":
            case "rampDownTheSarcasm":
            case "rampUpTheSarcasm":
            case "help":
                return reply(
                    command(commandArgs),
                    event
                );
                break;
            case "listCommands":
                return reply(
                    command(acceptableUsers.indexOf(String(event.user_id)) !== -1, commandArgs),
                    event
                );
                break;
            case "listFlagCount":
                return speaker(command(ITEMS.flags, commandArgs));
                break;
            default:
                return say(command(commandArgs))
                break;

        }
    } else {
        return say("Command " + commandName + " not recognised.")
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
            return processCommand(event);
            break;
        case EVENT_TYPES.MessageEdited:
            return processCommand(event);
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
                return say(
                    messageFormatting.room(event) +
                    messageFormatting.activity(" highly starred [message](http://chat.stackexchange.com/transcript/message/" + event.message_id + "#" + event.message_id + ") with ") +
                    event.message_stars +
                    " stars."
                )
                .then(function(){
                    return noPrefixSay(
                        "http://chat.stackexchange.com/transcript/message/" + event.message_id + "#" + event.message_id
                    );
                });
            }
            break;
        case EVENT_TYPES.MessageFlagged:
            if (!ITEMS.flags.hasOwnProperty(event.message_id)){
                ITEMS.flags[event.message_id] = event;
                ITEMS.flags[event.message_id].site = "SE";
                specialSay(
                    messageFormatting.activity("A [message](http://chat.stackexchange.com/transcript/message/" + event.message_id + "#" + event.message_id + ") in ") +
                    messageFormatting.room(event) +
                    messageFormatting.activity(" was flagged.")
                ).then(function(){
                    return say(
                        messageFormatting.activity("A [message](http://chat.stackexchange.com/transcript/message/" + event.message_id + "#" + event.message_id + ") in ") +
                        messageFormatting.room(event) +
                        messageFormatting.activity(" was flagged.")
                    );
                });
                // Uncomment the line below to turn on sharing of the message
                //say(messageFormatting.content(event));
            }
            break;
        default:
            return false;
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
