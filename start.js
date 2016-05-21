var botCore = require('./chat_modules_bot/core');
var mainCore = require('./chat_modules/core');
var commandManager = require('./commands');

commandManager.setCore(mainCore);
commandManager.setBotCore(botCore);

var getAWakeupMessage = function(){
    var messages = [
        'Why am I getting up?',
        'Seriously, this again?',
        'Why do you hate me so?',
        'Captain Quill\'s log, Day#143: We\'re still hiding in fear of these ' +
            'manical bots, the crew are running low on food and some are talking of eating the' +
            'Java developers first... their language\'s verbosity makes them more tender when slow roasted.',
        'Alright, alright, give me a minute',
        'What\'s the point in even getting up?',
        'Time to start the daily grind'
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

var botPrefix = "[ [**Marvin**](https://git.io/vrgPr) ] ";
var chatDomain = mainCore.chatAbbreviationToFull("SE");

mainCore.start()
.then(function() {
    console.log("Main core started");
    return botCore.start();
})
.then(function(){
    console.log("Bot core started");
    botCore.actions.send(chatDomain, 39270, botPrefix + getAWakeupMessage());
    mainCore.set.say(function (message){
        return botCore.actions.send(chatDomain, 39270, botPrefix + message);
    });
    mainCore.set.specialSay(function (message){
        return new Promise(function(resolve, reject){
            console.log(message);
            resolve();
        });
    });
    mainCore.set.noPrefixSay(function (message){
        return botCore.actions.send(chatDomain, 39270, message);
    });
    mainCore.set.reply(function (message, event){
        return botCore.actions.send(chatDomain, 39270, ":" + event.message_id + " " + message);
    });
});
