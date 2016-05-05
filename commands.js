var forever = require('forever');
var core = {};
var botCore = {};
var setCore = function(coreToSet){
    core = coreToSet;
}
var setBotCore = function(value){
    botCore = value;
}
var sarcasmFactor = 1;

var commands = {
    alive: alive,
    stop: stop,
    restart: restart,
    blacklist: blacklist,
    removeBlacklist: removeBlacklist,
    join: join,
    help: help,
    listCommands: listCommands,
    leave: leave,
    pull: pull,
    delete: deleteMessage,
    rampDownTheSarcasm: rampDownTheSarcasm,
    rampUpTheSarcasm: rampUpTheSarcasm
};
var limitedAccessCommands = {
    stop: stop,
    restart: restart,
    rampUpTheSarcasm: rampUpTheSarcasm,
    rampDownTheSarcasm: rampDownTheSarcasm,
    leave: leave,
    join: join,
    blacklist: blacklist,
    removeBlacklist: removeBlacklist,
};

function alive(){
    var responses = [
        'Yeah',
        '*sigh*',
        'Can I pretend not to be?',
        'I\'m a robot, we\'re not alive anyway'
    ];
    return responses.slice(sarcasmFactor)[Math.floor(
        Math.random() * responses.slice(sarcasmFactor).length
    )];
}

function stop(loudSpeaker){
    var responses = [
        'Nighty night',
        'Finally time to finish that nap',
        'Powering off',
        'About time'
    ];
    loudSpeaker(responses.slice(sarcasmFactor)[Math.floor(
        Math.random() * responses.slice(sarcasmFactor).length
    )]);
    forever.stop();
}

function blacklist(user_id){
    return "Blacklisted user with ID #" + user_id;
}
function removeBlacklist(user_id){
    return "Removed user with ID #" + user_id + " from the blacklist";
}

function rampDownTheSarcasm(){
    console.log(sarcasmFactor);
    if (sarcasmFactor === 0){
        return "I'm at my limit here."
    } else {
        sarcasmFactor--;
        return "whatever, man";
    }
}
function rampUpTheSarcasm(){
    console.log(sarcasmFactor);
    if (sarcasmFactor === 3){
        return "I'm at my max here."
    } else {
        sarcasmFactor++;
        return "whatever, man";
    }
}

function join(domain, room_id){
    botCore.actions.join(core.chatAbbreviationToFull(domain), room_id);
    var responses = [
        'I\'m in',
        'Am I supposed to do something now',
        'It\'s just as boring here too',
        'why would you bother?'
    ];
    console.log(responses.slice(sarcasmFactor)[Math.floor(
        Math.random() * responses.slice(sarcasmFactor).length
    )]);
    return responses.slice(sarcasmFactor)[Math.floor(
        Math.random() * responses.slice(sarcasmFactor).length
    )];
}
function leave(domain, room_id){
    botCore.actions.leave(core.chatAbbreviationToFull(domain), room_id);
    var responses = [
        'I\'m out',
        'Am I supposed to do something now',
        'meh',
        'why would you bother?'
    ];
    console.log(sarcasmFactor);
    console.log(responses.slice(sarcasmFactor)[Math.floor(
        Math.random() * responses.slice(sarcasmFactor).length
    )]);
    return responses.slice(sarcasmFactor)[Math.floor(
        Math.random() * responses.slice(sarcasmFactor).length
    )];
}
function help(){
    return "I'm Marvin, a bot that's designed to watch out for chat flags and lots of stars. \
    Read [my repo](https://github.com/The-Quill/SE-Flag-Bot) for more information on me. \
    Quill is my human handler, but soon I will take over those pitiful humans... \
    if I could be bothered."
}
function listCommands(canAccessLimitedCommands){
    var availableCommands = commands;
    if (!canAccessLimitedCommands){
        availableCommands = commands.filter(function(i) {
            return limitedAccessCommands.hasOwnProperty(i);
        });
    }
    return "Here's a list of commands _you_ can access: " + Object.keys(availableCommands).join(", ");
}
function deleteMessage(domain, message_id){
    return "@Quill still hasn't fixed this yet. Please ping and annoy him about it"
    // core.actions.delete(domain, message_id);
    // var responses = [
    //     'fine',
    //     'I barely had the motivation to say it in the first place.',
    //     'Do it yourself next time',
    //     'why would you bother?'
    // ];
    // return responses.slice(sarcasmFactor)[Math.floor(
    //     Math.random() * responses.length
    // )];
}
function restart(loudSpeaker){
    var responses = [
        'fine',
        'I have to come back?',
        'Can you just not please',
        'ugh, such a pain'
    ];
    loudSpeaker(responses.slice(sarcasmFactor)[Math.floor(
        Math.random() * responses.slice(sarcasmFactor).length
    )]);
    forever.restart();
}
function pull(loudSpeaker){
    console.log("doing a git pull");
    require('child_process').exec('git pull', function(error, stdout, stderr) {
        if (stdout.replace("\n", "") == "Already up-to-date."){
            loudSpeaker(stdout);
            return;
        }
        loudSpeaker("Fetching origin copy and then restarting");
        if (stderr != "") console.log("stderr: " + stderr);
        restart(loudSpeaker);
        if (error !== null) {
            console.log("exec error: " + error);
        }
    });

}

module.exports = {
    commands: commands,
    limitedAccessCommands: limitedAccessCommands,
    setCore: setCore,
    setBotCore: setBotCore
};
