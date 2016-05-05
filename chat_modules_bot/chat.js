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
var setMessageFormatting = function(formatting) {
    messageFormatting = formatting;
};
var setOutputType = function(value){
    say = value;
}
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

/* eslint-disable complexity, max-statements */
var processEvent = function(event) {
    if (event.content == ITEMS.lastEventContent) {
        return false;
    }
    ITEMS.lastEventContent = event.content;
    event.content = convert(event.content);
    switch (event.event_type) {
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

/* eslint-enable complexity, max-statements */
module.exports = {
    processEvent: processEvent,
    convert: convert,
    setMessageFormatting: setMessageFormatting,
    setOutputType: setOutputType,
    ITEMS: ITEMS,
    EVENT_TYPES: EVENT_TYPES
};
