var botCore = require('./chat_modules_bot/core');
var mainCore = require('./chat_modules/core');

var getAWakeupMessage = function(){
    var messages = [
        'Why am I getting up?',
        'Seriously, this again?',
        'Alright, alright, give me a minute',
        'What\'s the point in even getting up?'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

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
mainCore.setMessageFormatting(messageFormatting);
botCore.setMessageFormatting(messageFormatting);
mainCore.setOutputType(function(message){
    var chatDomain = core.chatAbbreviationToFull("SE");
    botCore.actions.send(chatDomain, 39270, message);
});

var botPrefix = "[ [Marvin](https://github.com/The-Quill/SE-Flag-Bot) ] ";
var chatDomain = mainCore.chatAbbreviationToFull("SE");
mainCore.start()
.then(function() {
    console.log("Main core started");
    return botCore.start();
})
.then(function(){
    console.log("Bot core started");
    botCore.actions.send(chatDomain, 39270, botPrefix + getAWakeupMessage());
    mainCore.setOutputType(function(message){
        botCore.actions.send(chatDomain, 39270, botPrefix + message);
    });
});
