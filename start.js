var botCore = require('./chat_modules_bot/core');
var mainCore = require('./chat_modules/core');
var commandManager = require('./commands');

var siteIdToPostTo = 1;
var chatDomainToPostTo = "SE"; // in list SE, SO and MSE
var botPrefix = "< [**SE-Flag-Bot**](https://git.io/vrgPr) > ";

commandManager.setCore(mainCore);
commandManager.setBotCore(botCore);

var getAWakeupMessage = function(){
    var messages = [
        'Hello'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};

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
mainCore.set.messageFormatting(messageFormatting);
botCore.setMessageFormatting(messageFormatting);
mainCore.set.commands(commandManager.commands);
mainCore.set.limitedAccessCommands(commandManager.limitedAccessCommands);

var chatDomain = mainCore.chatAbbreviationToFull(chatDomainToPostTo);

mainCore.start()
.then(function() {
    console.log("Main core started");
    return botCore.start();
})
.then(function(){
    console.log("Bot core started");
    botCore.actions.send(chatDomain, siteIdToPostTo, botPrefix + getAWakeupMessage());
    mainCore.set.say(function (message){
        return botCore.actions.send(chatDomain, siteIdToPostTo, botPrefix + message);
    });
    mainCore.set.noPrefixSay(function (message){
        return botCore.actions.send(chatDomain, siteIdToPostTo, message);
    });
    mainCore.set.reply(function (message, event){
        return botCore.actions.send(chatDomain, siteIdToPostTo, ":" + event.message_id + " " + message);
    });
});
