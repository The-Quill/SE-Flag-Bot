#SE Flag Bot

![](https://travis-ci.org/The-Quill/SE-Flag-Bot.svg?branch=master)

##What is this?

A bot that posts flagged messages

---
##How to get started

To get started, build the required plugins by calling:

     npm install

##How to set up the credentials and config

Then, add the 10k>= rep username and password to the relevant strings to your environment place (`.bash_profile` on Mac/Linux, or `.zshenv` if using `zsh`) by adding something like:

    export REP_USER_EMAIL=you@example.com
    export REP_USER_PASSWORD=password

and then add the bot's credentials like so:


    export BOT_EMAIL=bot@example.com
    export BOT_PASSWORD=password


In the main folder, you'll find a `config-SAMPLE.json`

Copy this to a `config.json` file and see the section below on how to setup the config file.

Navigate to the folder in Terminal/CMD, and call

    node start.js

###config

In the main folder, you'll find a `config-SAMPLE.json`

Copy this to a `config.json` file.

In the sample file, you'll find three variables that you'll need to interact with:


 - `debug`
 - `star_threshold`
 - `room_domains`

 ####`debug`

 `debug` is a boolean that represents whether you want system messages, (such as join responses, connection losses) to appear alongside the chat events in the main feed.

 (defaults to `false`)

 ---
 ####`star_threshold`

 `star_threshold` is an integer representing the amount of stars a post must get before it appears in the chat feed

 (defaults to 9)

 ---
 ####`room_domains`

 This variable is a little more complicated.

 It's an object where the keys are the domain names (`StackExchange`, `MetaStackExchange` and `StackOverflow` (upper or lower case doesn't matter))

```
     "room_domains": {
          "stackexchange": {
               // ...
          }
     }
```

Inside that, you have the `rooms` object, which contains all the rooms you want to automatically connect to upon startup

They're structured where the room id is the key and inside that, you have

 - `room_id`
 - `name`

---
##Sample config

Here is a sample config of chat.meta.stackexchange.com, where you connect to Tavern on the Meta upon startup
>
```
"MetaStackExchange": {
    "rooms": {
         "89": {
            "name": "Tavern on the Meta",
            "room_id": 89
         }
    }
},
```

---
##What you need to do to your SE account before you can use this:

 - Make sure you have an SE, SO and MSE account with the minimum rep to talk in chat (15).

 For SE, this just means you need 15 rep on any one site, but for MSE and SO, you need 15 rep specifically on those sites. You can just get this by making edits or something (but don't make pointless edits please)

 - Make sure your password and email is correct

There is an error message for this, but I'm still going to say it anyway.

---
##License

This code is licensed under the MIT license.
