var assert = require('chai').assert;
var ChatHandler = require('../chat_modules/chat');
var CommandManager = require('../commands');
var EVENT_TYPES = ChatHandler.EVENT_TYPES;

var messageFormatting = {
    room: function(event) {
        return "[" +
            event.room_name +
            "](http://chat.stackexchange.com/rooms/" +
            event.room_id +
            ")";
    },
    user: function(event) {
        return "[" +
            event.user_name +
            "](http://chat.stackexchange.com/users/" +
            event.user_id +
            ")";
    },
    activity: function(string) {
        return string;
    },
    content: function(event) {
        return event.content;
    },
    edited: function(event) {
        var maxStringLength = 25;
        var editedStringLength = Math.ceil(maxStringLength / 2);
        return event.content.length > maxStringLength ? event.content.substring(0, editedStringLength + "...") : event.content;
    },
    changedRoomName: function(event) {
        var name = event.content.substring(0, event.content.lastIndexOf(" /"));
        return "[" +
            event.room_id +
            ": " +
            name +
            "]";
    },
    messageId: function(event) {
        return event.message_id;
    },
    connection: function(event) {
        return "Connecting to " + event.name;
    },
};
ChatHandler.set.messageFormatting(messageFormatting);
ChatHandler.set.say(function(input){
    return input;
});
ChatHandler.set.reply(function(input){
    return input;
});
ChatHandler.set.commands(CommandManager.commands);


var SampleEventMaker = function(){
    return {
        message_id: '',
        user_id: '',
        content: '',
        event_type: ''
    };
}

describe('Chat handler', function() {
    describe('Commands', function() {
        // function blacklist(user_id){
        //     return "Blacklisted user with ID #" + user_id;
        // }
        // function removeBlacklist(user_id){
        //     return "Removed user with ID #" + user_id + " from the blacklist";
        // }
        describe('help', function(){
            it ('should respond with the correct response', function(){
                var event = SampleEventMaker();
                event.content = "!!/help";
                event.message_id = 12;
                event.room_name = "cats!";
                event.room_id = "39270";
                event.event_type = EVENT_TYPES.MessagePosted;
                assert.equal('I\'m Marvin, a bot that\'s designed to watch out for chat flags and lots of stars.     Read [my repo](https://github.com/The-Quill/SE-Flag-Bot) for more information on me.     Quill is my human handler, but soon I will take over those pitiful humans...     if I could be bothered.', ChatHandler.processEvent(event));
            });
        });
        describe('blacklist somebody', function(){
            it('should respond with the correct message', function(){
                var event = SampleEventMaker();
                event.content = "!!/blacklist 99999";
                event.user_id = '145604';
                event.room_id = "39270";
                event.event_type = EVENT_TYPES.MessagePosted;
                assert.equal("Blacklisted user with ID #99999", ChatHandler.processEvent(event));
            });
            it('should refuse as they\'ve already been blacklisted', function(){
                var event = SampleEventMaker();
                event.content = "!!/blacklist 100000";
                event.user_id = '145604';
                event.room_id = "39270";
                event.event_type = EVENT_TYPES.MessagePosted;
                /* Blacklist someone */
                ChatHandler.processEvent(event);
                /* Clear the two-in-a-row rule */
                event.content = "!!/cats";
                ChatHandler.processEvent(event);
                /* Do the command again */
                event.content = "!!/blacklist 100000";
                assert.equal("They're already blacklisted.", ChatHandler.processEvent(event));

                event.content = "!!/removeBlacklist 100000";
                ChatHandler.processEvent(event);
            });
        });
        describe('remove the blacklist somebody', function(){
            it('should respond with the correct message', function(){
                var event = SampleEventMaker();
                event.content = "!!/blacklist 100001";
                event.user_id = '145604';
                event.room_id = "39270";
                event.event_type = EVENT_TYPES.MessagePosted;
                /* Blacklist someone */
                ChatHandler.processEvent(event);
                /* Do the command  */
                event.content = "!!/removeBlacklist 100001";
                assert.equal("Removed user with ID #100001 from the blacklist", ChatHandler.processEvent(event));
            });
            it('should refuse as they\'ve already been removed', function(){
                var event = SampleEventMaker();
                event.content = "!!/blacklist 100000";
                event.user_id = '145604';
                event.room_id = "39270";
                event.event_type = EVENT_TYPES.MessagePosted;
                /* Blacklist someone */
                ChatHandler.processEvent(event);
                /* Unblacklist them */
                event.content = "!!/removeBlacklist 100000";
                ChatHandler.processEvent(event);
                /* Do the command again */
                event.content = "!!/removeBlacklist 100000";
                assert.equal("They're not blacklisted.", ChatHandler.processEvent(event));
                //"They're not blacklisted."
            });
            it('should refuse as they\'ve already been removed', function(){
                var event = SampleEventMaker();
                event.content = "!!/removeBlacklist 100002";
                event.user_id = '145604';
                event.room_id = "39270";
                event.event_type = EVENT_TYPES.MessagePosted;
                assert.equal("They're not blacklisted.", ChatHandler.processEvent(event));
            });
        });
        describe('empty command', function(){
            it ('should respond with the correct response', function(){
                var event = SampleEventMaker();
                event.content = "!!/";
                event.message_id = 12;
                event.room_name = "cats!";
                event.room_id = "39270";
                event.event_type = EVENT_TYPES.MessagePosted;
                assert.equal('You need to actually type a command...', ChatHandler.processEvent(event));
            });
        });
        describe('Authorised user', function(){
            it ('should respond with a no', function(){
                var event = SampleEventMaker();
                event.content = "!!/rampDownTheSarcasm";
                event.room_id = "39270";
                event.user_id = -99;
                event.event_type = EVENT_TYPES.MessagePosted;
                assert.equal('I can\'t let you do that.', ChatHandler.processEvent(event));
            });
            it ('should have no issues', function(){
                var event = SampleEventMaker();
                event.content = "!!/rampUpTheSarcasm";
                event.message_id = 12;
                event.user_id = 145604;
                event.room_name = "cats!";
                event.room_id = "39270";
                event.event_type = EVENT_TYPES.MessagePosted;
                assert.equal("whatever, man", ChatHandler.processEvent(event));
            });
        });
        describe('Blacklisted user', function(){
            it ('should respond with a no', function(){
                var event = SampleEventMaker();
                event.content = "!!/help";
                event.user_id = -99;
                event.room_id = "39270";
                event.event_type = EVENT_TYPES.MessagePosted;
                assert.equal("I can't let you do that.", ChatHandler.processEvent(event));
            });
            it ('should have no issues', function(){
                var event = SampleEventMaker();
                event.content = "!!/cats";
                event.room_id = "39270";
                event.event_type = EVENT_TYPES.MessagePosted;
                assert.equal('Command cats not recognised.', ChatHandler.processEvent(event));
            });
        });
    });
    describe('Event', function(){
        describe('Empty', function(){
            it ('should do nothing', function(){
                assert.equal(false, ChatHandler.processEvent(SampleEventMaker()));
            });
        });
        describe('Flag', function(){
            it ('should return a correct flag message', function(){
                var event = SampleEventMaker();
                event.content = "WOW!";
                event.message_id = 12;
                event.room_name = "cats!";
                event.room_id = "42";
                event.event_type = EVENT_TYPES.MessageFlagged;
                assert.equal('A [message](http://chat.stackexchange.com/transcript/message/12#12) in [cats!](http://chat.stackexchange.com/rooms/42) was flagged.', ChatHandler.processEvent(event));
            });
        });
        describe('Message', function(){
            it ('shouldn\'t respond to a normal message', function(){
                var event = SampleEventMaker();
                event.content = "WOW!";
                event.room_id = "39270";
                event.event_type = EVENT_TYPES.MessagePosted;
                assert.equal(false, ChatHandler.processEvent(event));
            });
            it ('shouldn\'t respond to a message in a room that isn\'t his room', function(){
                var event = SampleEventMaker();
                event.content = "!!/WOW!";
                event.room_id = "42";
                event.event_type = EVENT_TYPES.MessagePosted;
                assert.equal(false, ChatHandler.processEvent(event));
            });
            it ('should respond to a command message differently', function(){
                var event = SampleEventMaker();
                event.content = "!!/wtf"; // For some reason WOW! doesn't work...
                event.room_id = 39270;
                event.event_type = EVENT_TYPES.MessagePosted;
                assert.equal('Command wtf not recognised.', ChatHandler.processEvent(event));
            });
        });
    });
    describe('Data Retention', function(){

    });
});
